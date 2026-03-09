import { EQUAL_FUNCTION_STRICT_EQUAL, type EqualFunction } from '@xstd/equal-function';
import type { UndoFunction } from '@xstd/undo-function';
import { createReactiveSystem, type Link, type ReactiveNode } from 'alien-signals/system';
import type { RunBatch } from '../interfaces/batch/batch.ts';
import type { ComputedSignal } from '../interfaces/computed/computed-signal.ts';
import type { RunComputed } from '../interfaces/computed/constructor/computed-signal-constructor.ts';
import type { RunEffect } from '../interfaces/effect/effect.ts';
import type { SignalOptions } from '../interfaces/signal/constructor/signal-options.ts';
import { SIGNAL } from '../interfaces/signal/signal.symbol.ts';
import type { Signal } from '../interfaces/signal/signal.ts';
import type { WritableSignal } from '../interfaces/writable-signal/writable-signal.ts';

// source: https://github.com/stackblitz/alien-signals/blob/master/src/index.ts
// based on 3.1.2: https://github.com/stackblitz/alien-signals/blob/52142d981fddef13c57250d71aa6c7233bd94140/src/index.ts

/* REACTIVE SYSTEM */

const ReactiveFlags = Object.freeze({
  None: 0,
  Mutable: 1,
  Watching: 2,
  RecursedCheck: 4,
  Recursed: 8,
  Dirty: 16,
  Pending: 32,
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

interface ComputedNode<GValue> extends ReactiveValueNode<GValue> {
  readonly fn: RunComputed<GValue>;

  value: GValue | undefined;
}

interface EffectNode extends ReactiveNode {
  readonly fn: RunEffect;
}

let cycle: number = 0;
let batchDepth: number = 0;
let notifyIndex: number = 0;
let queuedLength: number = 0;
let activeSub: ReactiveNode | undefined;

const queued: (EffectNode | undefined)[] = [];

const { link, unlink, propagate, checkDirty, shallowPropagate } = createReactiveSystem({
  update(node: ReactiveValueNode<unknown>): boolean {
    if (node.depsTail !== undefined) {
      return updateComputedNode(node as ComputedNode<unknown>);
    } else {
      return updateSignalNode(node as SignalNode<unknown>);
    }
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
  unwatched(node: ReactiveNode): void {
    if (!(node.flags & ReactiveFlags.Mutable)) {
      unwatchNode(node);
    } else if (node.depsTail !== undefined) {
      node.depsTail = undefined;
      node.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
      purgeDeps(node);
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
  ++cycle;
  node.depsTail = undefined;
  node.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
  const prevSub: ReactiveNode | undefined = setActiveSub(node);
  try {
    const oldValue: unknown = node.value;
    return !node.equal(oldValue, (node.value = node.fn()));
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
    ++cycle;
    node.depsTail = undefined;
    node.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck;
    const prevSub: ReactiveNode | undefined = setActiveSub(node);
    try {
      node.fn();
    } finally {
      activeSub = prevSub;
      node.flags &= ~ReactiveFlags.RecursedCheck;
      purgeDeps(node);
    }
  } else {
    node.flags = ReactiveFlags.Watching;
  }
}

/**
 * @alias effectScopeOper
 */
function unwatchNode(node: ReactiveNode): void {
  node.depsTail = undefined;
  node.flags = ReactiveFlags.None;
  purgeDeps(node);
  const sub: Link | undefined = node.subs;
  if (sub !== undefined) {
    unlink(sub);
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
    let sub: ReactiveNode | undefined = activeSub;
    while (sub !== undefined) {
      if (sub.flags & (ReactiveFlags.Mutable | ReactiveFlags.Watching)) {
        link(node, sub, cycle);
        break;
      }
      sub = sub.subs?.sub;
    }
    return node.currentValue;
  };

  return Object.assign(get, {
    [SIGNAL]: undefined,
    set: (value: GValue): void => {
      if (activeSub !== undefined) {
        throw new Error('Signal value cannot be set while a computation/effect is running.');
      }

      const pendingValue: GValue = node.pendingValue;
      if (!node.equal(pendingValue, (node.pendingValue = value))) {
        node.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
        const subs: Link | undefined = node.subs;
        if (subs !== undefined) {
          propagate(subs);
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
  fn: RunComputed<GValue>,
  { equal = EQUAL_FUNCTION_STRICT_EQUAL }: SignalOptions<GValue> = {},
): ComputedSignal<GValue> {
  const node: ComputedNode<GValue> = {
    equal,
    fn,
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
          node.value = node.fn();
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
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: ReactiveFlags.Watching | ReactiveFlags.RecursedCheck,
  };

  const prevSub: ReactiveNode | undefined = setActiveSub(node);

  if (prevSub !== undefined) {
    link(node, prevSub, 0);
  }

  try {
    node.fn();
  } finally {
    activeSub = prevSub;
    node.flags &= ~ReactiveFlags.RecursedCheck;
  }

  // alias: effectOper => effectScopeOper
  return (): void => {
    if (node.flags !== ReactiveFlags.None) {
      unwatchNode(node);
    }
  };
}

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
  if (activeSub === undefined) {
    throw new Error('Expected a untracked to be running.');
  }
}
