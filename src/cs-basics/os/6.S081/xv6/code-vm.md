---
icon: ph:file-code
date: 2024-05-10
category:
  - 操作系统
tag:
  - MIT
  - XV6
  - riscv
  - C
---

# XV6源码精读 -- vm.c

## uvmcreate()

在操作系统中，每个进程都有自己的页表，用于管理其虚拟地址空间。当操作系统创建新的进程时，需要为该进程分配一个新的页表。

```c
// 创建一个空的用户页表
// 如果没有内存了就返回0
pagetable_t
uvmcreate()
{
  pagetable_t pagetable;
  pagetable = (pagetable_t) kalloc();
  if(pagetable == 0)
    return 0;
  //将此页表都填充成0
  memset(pagetable, 0, PGSIZE);
  return pagetable;
}
```

使用 `memset` 函数将分配的物理页的内容初始化为0。这样做是为了确保新分配的页表中的所有条目都是无效的，即没有任何虚拟地址被映射到物理地址。

## freewalk(pagetable_t pagetable)

此函数的作用是递归释放一个页表及其所有子页表所占用的内存空间。当一个进程终止时，或者内核需要释放一个进程的虚拟地址空间时，需要将该进程的页表所占用的内存释放回内存池，以便其他进程或内核可以重新利用这些内存空间。

```c
// 递归释放页表页。
// 所有叶子映射必须已经被移除。
void
freewalk(pagetable_t pagetable)
{
  // 一个页表中有 2^9 = 512 个页表项。
  for(int i = 0; i < 512; i++){
    pte_t pte = pagetable[i];
    if((pte & PTE_V) && (pte & (PTE_R|PTE_W|PTE_X)) == 0){
      // 这个页表项指向一个更低级别的页表。
      uint64 child = PTE2PA(pte);
      freewalk((pagetable_t)child);
      pagetable[i] = 0;
    } else if(pte & PTE_V){
      panic("freewalk: leaf");
    }
  }
  //kfree回收 kalloc分配的物理内存。
  kfree((void*)pagetable);
}
```

- `(pte & PTE_V)`: 这部分检查页表项是否有效。在 xv6 中，`PTE_V` 表示页表项有效，即该条目对应的虚拟地址是有效的。如果 `pte & PTE_V` 的结果为非零值，则表示该页表项是有效的。
- `(pte & (PTE_R|PTE_W|PTE_X))`: 这部分检查页表项是否指向一个更低级别的页表（非叶子节点）。在 xv6 中，`PTE_R`、`PTE_W` 和 `PTE_X` 分别表示页面是否可读、可写和可执行。如果 `pte & (PTE_R|PTE_W|PTE_X)` 的结果为非零值，则表示该页表项指向的是一个物理页面，而不是另一个页表。因此，该条件检查了页表项既有效又不是叶子节点。