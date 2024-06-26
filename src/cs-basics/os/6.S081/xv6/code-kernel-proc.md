---
icon: ph:file-code
date: 2024-05-07
category:
  - 操作系统
tag:
  - MIT
  - XV6
  - riscv
  - C
---

# XV6源码精读 -- proc.c

## proc_pagetable(struct proc *p)

此函数的作用是创建一个新的用户页表，并在其中映射跳板代码和陷阱帧页。这个函数通常用于操作系统内核中创建进程时初始化进程的页表。

```c
// 创建给定进程的用户页表，没有用户内存，但有跳板和陷阱帧页。
pagetable_t
proc_pagetable(struct proc *p)
{
  pagetable_t pagetable;

  // 创建一个空白页表
  pagetable = uvmcreate();
  if(pagetable == 0)
    return 0;

  //将跳板代码(用于系统调用返回)映射到最高的用户地址
  //只有内核使用该代码进出用户空间，所以不用设置PTE_U
  if(mappages(pagetable, TRAMPOLINE, PGSIZE,
              (uint64)trampoline, PTE_R | PTE_X) < 0){
    uvmfree(pagetable, 0);
    return 0;
  }

  // 将陷阱帧页映射到跳板页的下方，用于 trampoline.S
  if(mappages(pagetable, TRAPFRAME, PGSIZE,
              (uint64)(p->trapframe), PTE_R | PTE_W) < 0){
    uvmunmap(pagetable, TRAMPOLINE, 1, 0);
    uvmfree(pagetable, 0);
    return 0;
  }

  return pagetable;
}
```

1. `uvmcreate()` 定义于 `kernel/vm.c`  用于创建一个空白的页表

2. `mappages(pagetable_t pagetable, uint64 va, uint64 size, uint64 pa, int perm)`  定义于 `kernel/vm.c`   

   用于在操作系统内核中建立虚拟地址到物理地址的映射关系

   `pagetable`: 表示要操作的页表，它是一个指向页表的指针，用于存储虚拟地址和物理地址之间的映射关系。

   `va`: 虚拟地址，表示要进行映射的虚拟地址范围的起始地址。

   `size`: 表示要映射的虚拟地址范围的大小，以字节为单位。注意，这个大小可能不是页对齐的。

   `pa`: 物理地址，表示要映射的物理地址范围的起始地址。

   `perm`: 表示映射的权限，通常用于设置页表项中的权限位。常见的权限包括可读（PTE_R）、可写（PTE_W）、可执行（PTE_X）和用户态权限（PTE_U）等。

3. `TRAMPOLINE`与`TRAPFRAME` 定义在 `memlayout.h` 中他们的逻辑地址是计算出来了的并且大小只有一个页面
4. `trampoline`定义在汇编代码 `trampoline.S`中 跳板代码一开始存在于内核的代码段中，其物理地址与内核代码的物理地址相同。在操作系统启动时，内核会被加载到物理内存的某个位置，并且跳板代码也随之被加载到相应的物理地址处。
