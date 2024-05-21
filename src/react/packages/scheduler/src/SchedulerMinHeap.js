/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *       strict
 */

export function push(heap, node) {
  const index = heap.length;
  // 将node推到最小堆的最后一个位置
  heap.push(node);
  siftUp(heap, node, index);
}

export function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}

export function pop(heap) {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
}

function siftUp(heap, node, i) {
  let index = i;
  while (index > 0) {
    /*
    >>>: 二进制向右移动 右操作数值，取模 32，下面举个例子
    5： 0000 0000 0000 0000 0000 0000 0000 0101 >>> 1 === 0000 0000 0000 0000 0000 0000 0000 0010 === 2，
    想5这样的移动最右边的那个1就不要了，丢掉
    4: 0000 0000 0000 0000 0000 0000 0000 0100 >>> 1 === 0000 0000 0000 0000 0000 0000 0000 0010 === 2
    因此 >>> 1意味着数值/2向下取整；
    注意： 负数进行无符号右移会消除符号位的影响；
    */
    // 拿到父元素的Index；
    const parentIndex = (index - 1) >>> 1;
    // 父元素的值
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];

    // If the left or right node is smaller, swap with the smaller of those.
    if (compare(left, node) < 0) {
      /*
      rightIndex < length 这个判断是为了确保右子节点存在。
      在堆的实现中，我们通常会使用数组来表示堆，而数组的索引是从 0 开始的。
      在计算右子节点的索引时，我们首先要判断左子节点的索引加 1 是否小于数组的长度，以确保右子节点在数组中存在。
      如果右子节点的索引超出了数组的长度，说明该节点没有右子节点，此时就不需要考虑右子节点是否小于左子节点。
       */
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
