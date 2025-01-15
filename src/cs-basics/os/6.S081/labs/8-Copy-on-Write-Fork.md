---
icon: code-bold
date: 2025-01-15
category:
  - 操作系统
tags:
  - MIT
  - XV6
  - riscv
  - C
---
# Lab6:Copy-on-Write Fork for xv6

虚拟内存提供了一层间接性：内核可以通过将页表项（PTE）标记为无效或只读来拦截内存引用，从而引发页错误，并通过修改 PTE 来改变地址的含义。计算机系统中有一种说法，任何系统问题都可以通过一层间接性来解决。惰性分配实验室提供了一个例子。本实验将探索另一个例子：写时复制（Copy-on-Write, COW）的 fork。

要开始实验，切换到 cow 分支：
```bash
$ git fetch 
$ git checkout cow 
$ make clean
```
## 问题

xv6 中的 `fork()` 系统调用会将父进程的所有用户空间内存复制到子进程中。如果父进程很大，复制过程可能会花费很长时间。更糟糕的是，这种工作通常是浪费的；例如，子进程在 `fork()` 后执行 `exec()` 会导致子进程丢弃复制的内存，可能根本没有使用其中的大部分内容。另一方面，如果父进程和子进程都使用某个页面，并且其中一个或两个进程对其进行写操作，那么确实需要复制该页面。

## 解决方案

写时复制（COW）`fork()` 的目标是推迟为子进程分配和复制物理内存页面，直到真正需要时才进行复制（如果有的话）。

COW `fork()` 仅为子进程创建一个页表，其中的用户内存 PTE 指向父进程的物理页面。COW `fork()` 将父进程和子进程中的所有用户 PTE 标记为不可写。当任一进程尝试写入这些 COW 页面时，CPU 将强制引发页错误。内核的页错误处理程序会检测到这种情况，为引发错误的进程分配一个物理内存页面，将原始页面复制到新页面中，并修改引发错误的进程中的相关 PTE，使其指向新页面，这次将 PTE 标记为可写。当页错误处理程序返回时，用户进程将能够写入其页面的副本。

COW `fork()` 使得释放实现用户内存的物理页面变得稍微复杂一些。一个给定的物理页面可能被多个进程的页表引用，只有在最后一个引用消失时才应该被释放。
##  Implement copy-on write([hard](https://pdos.csail.mit.edu/6.S081/2020/labs/guidance.html))

你的任务是在 xv6 内核中实现写时复制（Copy-on-Write, COW）的 `fork`。如果你修改后的内核能够成功执行 `cowtest` 和 `usertests` 程序，那么你就完成了任务。

为了帮助你测试实现，我们提供了一个名为 `cowtest` 的 xv6 程序（源代码在 `user/cowtest.c` 中）。`cowtest` 运行各种测试，但在未修改的 xv6 上，即使是第一个测试也会失败。因此，最初你会看到：

```bash
$ cowtest
simple: fork() failed
$
```

“simple”测试分配了超过一半的可用物理内存，然后调用 `fork()`。由于没有足够的空闲物理内存来为子进程提供父进程内存的完整副本，`fork` 失败了。

当你完成后，你的内核应该通过 `cowtest` 和 `usertests` 中的所有测试。即：

```bash
$ cowtest
simple: ok
simple: ok
three: zombie!
ok
three: zombie!
ok
three: zombie!
ok
file: ok
ALL COW TESTS PASSED
$ usertests
...
ALL TESTS PASSED
$
```

### 实现计划

1. **修改 `uvmcopy()`**  
    将父进程的物理页面映射到子进程，而不是分配新页面。清除子进程和父进程 PTE 中的 `PTE_W` 标志。

2. **修改 `usertrap()`**  
    识别页错误。当发生 COW 页错误时，使用 `kalloc()` 分配一个新页面，将旧页面复制到新页面，并在 PTE 中安装新页面，同时设置 `PTE_W` 标志。

3. **确保物理页面在最后一个 PTE 引用消失时被释放**  
    但在此之前不能释放。一种好的方法是为每个物理页面维护一个“引用计数”，记录引用该页面的用户页表数量。当 `kalloc()` 分配页面时，将页面的引用计数设置为 1。当 `fork` 导致子进程共享页面时，增加页面的引用计数；当任何进程从其页表中删除页面时，减少页面的引用计数。只有当页面的引用计数为零时，`kfree()` 才应将页面放回空闲列表。可以将这些计数存储在一个固定大小的整数数组中。你需要设计一种方案来确定数组的索引和大小。例如，可以使用页面的物理地址除以 4096 作为数组的索引，并将数组的大小设置为 `kinit()` 在 `kalloc.c` 中放置在空闲列表中的任何页面的最高物理地址。

4. **修改 `copyout()`**  
    当遇到 COW 页面时，使用与页错误相同的方案。


### 提示

- **lazy allocate 实验** 可能已经让你熟悉了与写时复制相关的 xv6 内核代码。但是，你不应基于惰性分配解决方案来完成本实验；相反，请按照上述指示从全新的 xv6 副本开始。
- 记录每个 PTE 是否为 COW 映射可能很有用。你可以使用 RISC-V PTE 中的 RSW（保留给软件）位来实现这一点。
- `usertests` 探索了 `cowtest` 未测试的场景，因此不要忘记检查所有测试是否都通过了。
- 一些有用的宏和页表标志定义位于 `kernel/riscv.h` 的末尾。
- 如果发生 COW 页错误且没有空闲内存，则应终止该进程。
### 实验步骤
RISC-V 的 PTE 是一个 64 位的值，其位布局如下：

| 位范围   | 名称       | 描述                       |
| ----- | -------- | ------------------------ |
| 63:54 | PPN[2]   | 物理页号的高 10 位（指向下一级页表或页框）  |
| 53:44 | PPN[1]   | 物理页号的中 10 位              |
| 43:34 | PPN[0]   | 物理页号的低 10 位              |
| 33:10 | Reserved | 保留位                      |
| 9:8   | RSW      | 保留给软件使用的位（`PTE_RSW`）     |
| 7     | D        | Dirty（脏位，表示页面是否被修改过）     |
| 6     | A        | Accessed（访问位，表示页面是否被访问过） |
| 5     | G        | Global（全局位，表示页面是否全局共享）   |
| 4     | U        | User（用户位，表示页面是否可被用户模式访问） |
| 3     | X        | Executable（可执行位）         |
| 2     | W        | Writable（可写位）            |
| 1     | R        | Readable（可读位）            |
| 0     | V        | Valid（有效位）               |
修改 `kernel/riscv.h`
```c
#define PTE_X (1L << 3)

#define PTE_U (1L << 4) // 1 -> user can access
//新增行
#define PTE_COW (1L << 8) // copy on write flag
```

修改 `kernel/vm.c`

```c
//修改 uvmcopy 方法

int
uvmcopy(pagetable_t old, pagetable_t new, uint64 sz)
{

  pte_t *pte;
  uint64 pa, i;
  uint flags;
  //char *mem;
  
  for(i = 0; i < sz; i += PGSIZE){
    if((pte = walk(old, i, 0)) == 0)
      panic("uvmcopy: pte should exist");
    if((*pte & PTE_V) == 0)
      panic("uvmcopy: page not present");
    pa = PTE2PA(*pte);
    *pte = (*pte & ~PTE_W) | PTE_COW; //清除写权限，设置COW标志
    flags = PTE_FLAGS(*pte);//提取pte的标志位
    //不重新分配内存，而是对old 页表的物理地址进行映射
    if(mappages(new, i, PGSIZE, pa, flags) != 0){
      goto err;
    }

    inc_ref((void *)pa);
    // if((mem = kalloc()) == 0)
    //   goto err;
    // memmove(mem, (char*)pa, PGSIZE);
    // if(mappages(new, i, PGSIZE, (uint64)mem, flags) != 0){
    //   kfree(mem);
    //   goto err;
    // }
  }
  return 0;

 err:
  uvmunmap(new, 0, i / PGSIZE, 1);
  return -1;
}

//增加方法 用于判断当前页是否是 cow page 
int is_cow_page(pagetable_t pg, uint64 va) {
  //如果虚拟地址大于最大虚拟地址说明是非法地址
  if(va >= MAXVA)
    return 0;
  //虚拟地址向下取整  
  va = PGROUNDDOWN(va);
  //通过walk函数获取虚拟地址对应的pte
  pte_t *pte = walk(pg, va, 0);
  if (pte == 0) {
    return 0;
  }
  if((*pte & PTE_V) == 0)
    return 0;
  if((*pte & PTE_U) == 0)
    return 0;
  // 返回是否是cow 
  return (*pte & PTE_COW);
}

  
//对cow page 进行内存复制
int cow_alloc(pagetable_t pg,uint64 va){
  va = PGROUNDDOWN(va);
  pte_t *pte = walk(pg, va, 0);
  uint64 pa = PTE2PA(*pte);
  //获取原始页表的标志位信息
  int flags =  PTE_FLAGS(*pte);
  // 复制内存信息
  char *mem = kalloc();
  if (mem == 0) {
    return -1;
  }
  memmove(mem,(char *)pa, PGSIZE);
  // 解除对旧物理地址的映射，
  uvmunmap(pg, va, 1, 1);
  // 清除PTE_COW 标志位，设置可写标志
  flags = (flags & ~PTE_COW) | PTE_W;
  if(mappages(pg, va, PGSIZE, (uint64)mem, flags)<0){
    kfree(mem);
    return -1;
  }
  return 0;
}
```

修改`kernel/trap.c` 中的`usertrap(void)`方法。
```c
  } else if((which_dev = devintr()) != 0){
    // ok
  //=====================add code begin=============================
  } else if(r_scause() == 15 || r_scause() == 13){ //如果是page fault
    uint64 va = r_stval();
    if (is_cow_page(p->pagetable,va)) {
      if (cow_alloc(p->pagetable,va) < 0) {
        p->killed = 1;
      }
    } else {
      printf("usertrap(): cow unexpected scause %p pid=%d\n", r_scause(), p->pid);
      printf("            sepc=%p stval=%p\n", r_sepc(), r_stval());
      p->killed = 1;
    }
  }
 //=====================add code end=============================
  else {
    printf("usertrap(): unexpected scause %p pid=%d\n", r_scause(), p->pid);
    printf("            sepc=%p stval=%p\n", r_sepc(), r_stval());
    p->killed = 1;
  }
```

修改`kernel/kalloc.c`
```c

..........

extern char end[]; // first address after kernel.
                   // defined by kernel.ld
                   
int refcount[32768]; // 此数组用于记录，物理页被引用的次数

struct run {
  struct run *next;
};

.........

//用于计算物理页的索引值
int page_index(void *pa) {
  int res  = ((uint64)pa - (uint64)end) / PGSIZE;
  if(res<0 || res>=32768) {
    panic("page_index: invalid pa");
  }
  return res;
}

//对物理页引用数进行增加操作
int inc_ref(void *pa) {
  int index = page_index(pa);
  refcount[index]++;
  return refcount[index];
}

//对物理页引用数进行减少操作
int dec_ref(void *pa) {
  int index = page_index(pa);
  refcount[index]--;
  return refcount[index];
}

......

void
kfree(void *pa)
{
  struct run *r;
  //如果物理页引用数大于1 则不释放此页
  int index = page_index(pa);
  if(refcount[index] > 1) {
    dec_ref(pa);
    return;
  }
  //如果物理页的引用数为1 则需要将引用数减1，并执行释放物理页操作。
  if (refcount[index] == 1) {
    dec_ref(pa);
  }
  if(((uint64)pa % PGSIZE) != 0 || (char*)pa < end || (uint64)pa >= PHYSTOP)
    panic("kfree");
    
  // Fill with junk to catch dangling refs.
  memset(pa, 1, PGSIZE);
 
........


void *
kalloc(void)
{
  struct run *r;
  
  acquire(&kmem.lock);
  r = kmem.freelist;
  if(r)
    kmem.freelist = r->next;
  release(&kmem.lock);
  
  if(r){
    memset((char*)r, 5, PGSIZE); // fill with junk
    inc_ref((void *)r);//分配物理页的时候引用加1
  }
  return (void*)r;

}

```

在`kernel/defs.h`中增加刚刚添加的四个方法的声明
```c
// kalloc.c
int             inc_ref(void *);
int             dec_ref(void *);

// vm.c
int             is_cow_page(pagetable_t, uint64);
int             cow_alloc(pagetable_t, uint64);
```