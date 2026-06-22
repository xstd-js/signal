import { EQUAL_FUNCTION_STRICT_EQUAL, type EqualFunction } from '@xstd/equal-function';
import type { UndoFunction } from '@xstd/undo-function';
import { createReactiveSystem, type Link, type ReactiveNode } from 'alien-signals/system';
import type { RunBatch } from '../interfaces/batch/batch.ts';
import type { ComputedSignal } from '../interfaces/computed/computed-signal.ts';
import type { RunComputed } from '../interfaces/computed/constructor/computed-signal-constructor.ts';
import type { RunEffectScope } from '../interfaces/effect-scope/effect-scope.ts';
import type { RunEffect } from '../interfaces/effect/effect.ts';
import type { SignalOptions } from '../interfaces/signal/constructor/signal-options.ts';
import { SIGNAL } from '../interfaces/signal/signal.symbol.ts';
import type { Signal } from '../interfaces/signal/signal.ts';
import type { WritableSignal } from '../interfaces/writable-signal/writable-signal.ts';

// source: https://github.com/stackblitz/alien-signals/blob/master/src/index.ts
// based on 3.2.1 (Jun 10, 2026): https://github.com/stackblitz/alien-signals/blob/c00e63969bf261fc5dce31fae70cb9a90912b06e/src/index.ts

/* REACTIVE SYSTEM */

const ReactiveFlags = Object.freeze({
  None: 0,
  Mutable: 1,
  Watching: 2,
  RecursedCheck: 4,
  Recursed: 8,
  Dirty: 16,
  Pending: 32,
  HasChildEffect: 64,
});

type ReactiveFlags = (typeof ReactiveFlags)[keyof typeof ReactiveFlags];

interface ReactiveValueNode<GValue> extends ReactiveNode {
  readonly equal: EqualFunction<GValue>;
}

interface SignalNode<GValue> extends ReactiveValueNode<GValue> {
  currentValue: GValue;
  pendingValue: GValue;

  readonlyOutputSignal: Signal<GValue> | undefined;
}

function isSignalNode(node: ReactiveNode): node is SignalNode<unknown> {
  return 'currentValue' in node;
}

interface ComputedNode<GValue> extends ReactiveValueNode<GValue> {
  readonly getter: RunComputed<GValue>;

  value: GValue | undefined;
}

function isComputedNode(node: ReactiveNode): node is ComputedNode<unknown> {
  return 'getter' in node;
}

interface EffectNode extends ReactiveNode {
  readonly fn: RunEffect;
  cleanup: UndoFunction | undefined | void;
}

function isEffectNode(node: ReactiveNode): node is EffectNode {
  return 'fn' in node;
}

interface EffectScopeNode extends ReactiveNode {}

let cycle: number = 0;
let runDepth: number = 0;
let batchDepth: number = 0;
let notifyIndex: number = 0;
let queuedLength: number = 0;
let activeSub: ReactiveNode | undefined;

const queued: (EffectNode | undefined)[] = [];

const { link, unlink, propagate, checkDirty, shallowPropagate } = createReactiveSystem({
  update(node: SignalNode<unknown> | ComputedNode<unknown> | EffectScopeNode): boolean {
    if (isComputedNode(node)) {
      return updateComputedNode(node);
    }
    if (isSignalNode(node)) {
      return updateSignalNode(node);
    }
    node.flags = ReactiveFlags.Mutable;
    return true;
  },
  notify(node: EffectNode): void {
    let insertIndex: number = queuedLength;
    let firstInsertedIndex: number = insertIndex;

    do {
      queued[insertIndex++] = node;
      node.flags &= ~ReactiveFlags.Watching;
      node = node.subs?.sub as EffectNode;
      if (node === undefined || !(node.flags & ReactiveFlags.Watching)) {
        break;
      }
    } while (true);

    queuedLength = insertIndex;

    while (firstInsertedIndex < --insertIndex) {
      const left: EffectNode | undefined = queued[firstInsertedIndex];
      queued[firstInsertedIndex++] = queued[insertIndex];
      queued[insertIndex] = left;
    }
  },
  unwatched(
    node: SignalNode<unknown> | ComputedNode<unknown> | EffectNode | EffectScopeNode,
  ): void {
    if (isComputedNode(node)) {
      if (node.depsTail !== undefined) {
        node.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
        disposeAllDepsInReverse(node);
      }
    } else if (isSignalNode(node)) {
      // Nothing to do for signals, they are always mutable and never dirty until pendingValue changes
    } else if (isEffectNode(node)) {
      stopEffect(node);
    } else {
      stopEffectScopeNode(node);
    }
  },
});

function setActiveSub(sub: ReactiveNode | undefined): ReactiveNode | undefined {
  const prevSub: ReactiveNode | undefined = activeSub;
  activeSub = sub;
  return prevSub;
}

/**
 * @alias updateSignal
 */
function updateSignalNode(node: SignalNode<any>): boolean {
  node.flags = ReactiveFlags.Mutable;
  const currentValue: unknown = node.currentValue;
  return !node.equal(currentValue, (node.currentValue = node.pendingValue));
}

/**
 * @alias updateComputed
 */
function updateComputedNode(node: ComputedNode<any>): boolean {
  if (node.flags & ReactiveFlags.HasChildEffect) {
    let link: Link | undefined = node.depsTail;
    while (link !== undefined) {
      const prev: Link | undefined = link.prevDep;
      const dep: ReactiveNode = link.dep;
      if (!isComputedNode(dep) && !isSignalNode(dep)) {
        unlink(link, node);
      }
      link = prev;
    }
  }
  node.depsTail = undefined;
  node.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
  const prevSub: ReactiveNode | undefined = setActiveSub(node);
  try {
    ++cycle;
    const oldValue: unknown = node.value;
    return !node.equal(oldValue, (node.value = node.getter()));
  } finally {
    activeSub = prevSub;
    node.flags &= ~ReactiveFlags.RecursedCheck;
    purgeDeps(node);
  }
}

/**
 * @alias run
 */
function runEffectNode(node: EffectNode): void {
  const flags: ReactiveFlags = node.flags;
  if (
    flags & ReactiveFlags.Dirty ||
    (flags & ReactiveFlags.Pending && checkDirty(node.deps!, node))
  ) {
    if (flags & ReactiveFlags.HasChildEffect) {
      let link: Link | undefined = node.depsTail;
      while (link !== undefined) {
        const prev: Link | undefined = link.prevDep;
        const dep: ReactiveNode = link.dep;
        if (!isComputedNode(dep) && !isSignalNode(dep)) {
          unlink(link, node);
        }
        link = prev;
      }
    }
    if (node.cleanup) {
      runCleanup(node);
      if (!node.flags) {
        return;
      }
    }
    node.depsTail = undefined;
    node.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck;
    const prevSub: ReactiveNode | undefined = setActiveSub(node);
    try {
      ++cycle;
      ++runDepth;
      node.cleanup = node.fn();
    } finally {
      --runDepth;
      activeSub = prevSub;
      node.flags &= ~ReactiveFlags.RecursedCheck;
      purgeDeps(node);
    }
  } else if (node.deps !== undefined) {
    node.flags = ReactiveFlags.Watching | (flags & ReactiveFlags.HasChildEffect);
  }
}

function runCleanup(node: EffectNode): void {
  const cleanup: UndoFunction = node.cleanup!;
  node.cleanup = undefined;
  const prevSub: ReactiveNode | undefined = activeSub;
  activeSub = undefined;
  try {
    cleanup();
  } finally {
    activeSub = prevSub;
  }
}

/**
 * @alias effectOper
 */
function stopEffect(node: EffectNode): void {
  stopEffectScopeNode(node);
  if (node.cleanup) {
    runCleanup(node);
  }
}

/**
 * @alias effectScopeOper
 */
function stopEffectScopeNode(node: EffectScopeNode): void {
  node.flags = ReactiveFlags.None;
  disposeAllDepsInReverse(node);
  const sub: Link | undefined = node.subs;
  if (sub !== undefined) {
    unlink(sub);
  }
}

function disposeAllDepsInReverse(sub: ReactiveNode): void {
  let link: Link | undefined = sub.depsTail;
  while (link !== undefined) {
    const prev: Link | undefined = link.prevDep;
    unlink(link, sub);
    link = prev;
  }
}

function purgeDeps(sub: ReactiveNode): void {
  const depsTail: Link | undefined = sub.depsTail;
  let dep: Link | undefined = depsTail !== undefined ? depsTail.nextDep : sub.deps;
  while (dep !== undefined) {
    dep = unlink(dep, sub);
  }
}

function flush(): void {
  try {
    while (notifyIndex < queuedLength) {
      const effect: EffectNode = queued[notifyIndex]!;
      queued[notifyIndex++] = undefined;
      runEffectNode(effect);
    }
  } finally {
    while (notifyIndex < queuedLength) {
      const effect: EffectNode = queued[notifyIndex]!;
      queued[notifyIndex++] = undefined;
      effect.flags |= ReactiveFlags.Watching | ReactiveFlags.Recursed;
    }
    notifyIndex = 0;
    queuedLength = 0;
  }
}

/* IMPLEMENTATIONS */

// SIGNAL => alias `signalOper`

export function signal<GValue>(
  initialValue: GValue,
  { equal = EQUAL_FUNCTION_STRICT_EQUAL }: SignalOptions<GValue> = {},
): WritableSignal<GValue> {
  const node: SignalNode<GValue> = {
    equal,
    readonlyOutputSignal: undefined,

    currentValue: initialValue,
    pendingValue: initialValue,
    subs: undefined,
    subsTail: undefined,
    flags: ReactiveFlags.Mutable,
  };

  const get = (): GValue => {
    if (node.flags & ReactiveFlags.Dirty) {
      if (updateSignalNode(node)) {
        const subs: Link | undefined = node.subs;
        if (subs !== undefined) {
          shallowPropagate(subs);
        }
      }
    }
    const sub: ReactiveNode | undefined = activeSub;
    if (sub !== undefined) {
      link(node, sub, cycle);
    }
    return node.currentValue;
  };

  return Object.assign(get, {
    [SIGNAL]: undefined,
    set: (value: GValue): void => {
      // if (activeSub !== undefined) {
      //   throw new Error('Signal value cannot be set while a computation/effect is running.');
      // }

      const pendingValue: GValue = node.pendingValue;
      if (!node.equal(pendingValue, (node.pendingValue = value))) {
        node.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
        const subs: Link | undefined = node.subs;
        if (subs !== undefined) {
          propagate(subs, !!runDepth);
          if (!batchDepth) {
            flush();
          }
        }
      }
    },
    asReadonly: (): Signal<GValue> => {
      if (node.readonlyOutputSignal === undefined) {
        node.readonlyOutputSignal = Object.assign(
          (): GValue => {
            return get();
          },
          {
            [SIGNAL]: undefined,
          },
        );
      }

      return node.readonlyOutputSignal!;
    },
  } satisfies Omit<WritableSignal<GValue>, ''>);
}

// COMPUTED => alias `computedOper`

export function computed<GValue>(
  getter: RunComputed<GValue>,
  { equal = EQUAL_FUNCTION_STRICT_EQUAL }: SignalOptions<GValue> = {},
): ComputedSignal<GValue> {
  const node: ComputedNode<GValue> = {
    equal,
    getter,
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: ReactiveFlags.None,
  };

  return Object.assign(
    (): GValue => {
      const flags: ReactiveFlags = node.flags;
      if (
        flags & ReactiveFlags.Dirty ||
        (flags & ReactiveFlags.Pending &&
          (checkDirty(node.deps!, node) || ((node.flags = flags & ~ReactiveFlags.Pending), false)))
      ) {
        if (updateComputedNode(node)) {
          const subs: Link | undefined = node.subs;
          if (subs !== undefined) {
            shallowPropagate(subs);
          }
        }
      } else if (!flags) {
        node.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
        const prevSub: ReactiveNode | undefined = setActiveSub(node);
        try {
          node.value = node.getter();
        } finally {
          activeSub = prevSub;
          node.flags &= ~ReactiveFlags.RecursedCheck;
        }
      } else if (flags === (ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck)) {
        throw new Error('Computation loop detected.');
      }
      const sub: ReactiveNode | undefined = activeSub;
      if (sub !== undefined) {
        link(node, sub, cycle);
      }
      return node.value!;
    },
    {
      [SIGNAL]: undefined,
    },
  );
}

// EFFECT

export function effect(fn: RunEffect): UndoFunction {
  const node: EffectNode = {
    fn,
    cleanup: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: ReactiveFlags.Watching | ReactiveFlags.RecursedCheck,
  };

  const prevSub: ReactiveNode | undefined = setActiveSub(node);

  if (prevSub !== undefined) {
    link(node, prevSub, 0);
    prevSub.flags |= ReactiveFlags.HasChildEffect;
  }

  try {
    ++runDepth;
    node.cleanup = node.fn();
  } finally {
    --runDepth;
    activeSub = prevSub;
    node.flags &= ~ReactiveFlags.RecursedCheck;
  }

  return (): void => {
    stopEffect(node);
  };
}

// EFFECT SCOPE

export function effectScope(fn: RunEffectScope): UndoFunction {
  const node: EffectScopeNode = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: ReactiveFlags.Mutable,
  };

  const prevSub: ReactiveNode | undefined = setActiveSub(node);

  if (prevSub !== undefined) {
    link(node, prevSub, 0);
    prevSub.flags |= ReactiveFlags.HasChildEffect;
  }

  try {
    fn();
  } finally {
    activeSub = prevSub;
  }

  return (): void => {
    stopEffectScopeNode(node);
  };
}

// trigger => not implemented

// BATCH

export function batch<GReturn>(fn: RunBatch<GReturn>): GReturn {
  ++batchDepth;
  try {
    return fn();
  } finally {
    if (!--batchDepth) {
      flush();
    }
  }
}

export function expectBatch(): void {
  if (!batchDepth) {
    throw new Error('Expected a batch to be running.');
  }
}

// UNTRACKED

export function untracked<GReturn>(fn: RunBatch<GReturn>): GReturn {
  const prevSub: ReactiveNode | undefined = setActiveSub(undefined);
  try {
    return fn();
  } finally {
    activeSub = prevSub;
  }
}

export function expectUntracked(): void {
  if (activeSub !== undefined) {
    throw new Error('Expected a untracked to be running.');
  }
}
