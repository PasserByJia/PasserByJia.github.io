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