---
icon: code-bold
date: 2024-11-12
category:
  - 操作系统
tags:
  - MIT
  - C
  - riscv
  - XV6
---
# System Calls
在上一个实验中，你使用系统调用编写了一些实用程序。在这个实验中，你将向 xv6 添加一些新的系统调用，这将帮助你理解它们的工作原理，并让你接触到 xv6 内核的一些内部机制。在后续的实验中，你将添加更多的系统调用。

> [!warning]
> 开始编码之前，请阅读 xv6 书籍的第 2 章，以及第 4 章的第 4.3 节和第 4.4 节，并阅读相关的源文件：
> - 用户空间的系统调用代码 在 user/user.h 和 user/usys.pl 中。
> - 内核空间的系统调用代码 在 kernel/syscall.h 和 kernel/syscall.c 中。
> - 与进程相关的代码 在 kernel/proc.h 和 kernel/proc.c 中。

 开始实验，切换到 `syscall` 分支：

```bash
$ git fetch
$ git checkout syscall
$ make clean
```

如果你运行 `make grade`，你会看到评分脚本无法执行 `trace` 和 `sysinfotest`。你的任务是添加必要的系统调用和存根，使它们能够正常工作
## System call tracing ([moderate](https://pdos.csail.mit.edu/6.S081/2020/labs/guidance.html))

> [!important]
> 在这个任务中，你将添加一个系统调用跟踪功能，这可能会在你调试后续实验时有所帮助。你将创建一个新的 `trace` 系统调用，用于控制跟踪。它应该接受一个参数，一个整数“掩码”，其位指定要跟踪哪些系统调用。例如，要跟踪 `fork` 系统调用，程序调用 `trace(1 << SYS_fork)`，其中 `SYS_fork` 是 `kernel/syscall.h` 中的系统调用号。你需要修改 xv6 内核，以便在每个系统调用即将返回时，如果系统调用号在掩码中设置，则打印一行。该行应包含进程 ID、系统调用的名称和返回值；你不需要打印系统调用参数。`trace` 系统调用应为调用它的进程及其随后派生的任何子进程启用跟踪，但不应影响其他进程。
> 

我们提供了一个用户级程序 `trace`，它可以在启用跟踪的情况下运行另一个程序（参见 `user/trace.c`）。当你完成后，你应该看到类似以下的输出：

```bash
$ trace 32 grep hello README
3: syscall read -> 1023
3: syscall read -> 966
3: syscall read -> 70
3: syscall read -> 0
$
$ trace 2147483647 grep hello README
4: syscall trace -> 0
4: syscall exec -> 3
4: syscall open -> 3
4: syscall read -> 1023
4: syscall read -> 966
4: syscall read -> 70
4: syscall read -> 0
4: syscall close -> 0
$
$ grep hello README
$
$ trace 2 usertests forkforkfork
usertests starting
test forkforkfork: 407: syscall fork -> 408
408: syscall fork -> 409
409: syscall fork -> 410
410: syscall fork -> 411
409: syscall fork -> 412
410: syscall fork -> 413
409: syscall fork -> 414
411: syscall fork -> 415
...
$
```

在第一个示例中，`trace` 调用 `grep` 仅跟踪 `read` 系统调用。`32` 是 `1 << SYS_read`。在第二个示例中，`trace` 运行 `grep` 时跟踪所有系统调用；`2147483647` 设置了所有 31 个低位。在第三个示例中，程序未被跟踪，因此没有打印跟踪输出。在第四个示例中，`usertests` 中 `forkforkfork` 测试的所有后代进程的 `fork` 系统调用正在被跟踪。如果你的程序的行为如上所示（尽管进程 ID 可能不同），则你的解决方案是正确的。

### 一些提示：

1. **将 `$U/_trace` 添加到 `Makefile` 中的 `UPROGS`**。
    
2. **运行 `make qemu`，你会看到编译器无法编译 `user/trace.c`，因为用户空间的系统调用存根还不存在**：向 `user/user.h` 添加系统调用的原型，向 `user/usys.pl` 添加存根，并向 `kernel/syscall.h` 添加系统调用号。`Makefile` 调用 `user/usys.pl` 脚本，该脚本生成 `user/usys.S`，即实际的系统调用存根，它们使用 RISC-V 的 `ecall` 指令过渡到内核。一旦你修复了编译问题，运行 `trace 32 grep hello README`；它将失败，因为你还没有在内核中实现系统调用。
    
3. **在 `kernel/sysproc.c` 中添加一个 `sys_trace()` 函数，通过在 `proc` 结构（参见 `kernel/proc.h`）中记住其参数来实现新的系统调用**。用于从用户空间检索系统调用参数的函数在 `kernel/syscall.c` 中，你可以在 `kernel/sysproc.c` 中看到它们的使用示例。
    
4. **修改 `fork()`（参见 `kernel/proc.c`）以将跟踪掩码从父进程复制到子进程**。
    
5. **修改 `kernel/syscall.c` 中的 `syscall()` 函数以打印跟踪输出**。你需要添加一个系统调用名称数组来进行索引。