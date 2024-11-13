---
icon: code-bold
date: 2024-10-31
category:
  - 操作系统
tags:
  - MIT
  - C
  - riscv
  - XV6
---
# Lab 1:  Xv6 and Unix utilities

这个lab将会使你熟悉xv6个它的系统调用。
##  Boot xv6 ([easy](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))
你可以在Athena或者你自己的电脑上进行这些实验。如果你使用自己电脑进行实验，你需要看一下[lab tools page](https://pdos.csail.mit.edu/6.S081/2022/tools.html)中的配置提示。

如果你使用 Athena，你必须使用 x86 机器；也就是说，`uname -a` 应该显示 `i386 GNU/Linux` 或 `i686 GNU/Linux` 或 `x86_64 GNU/Linux`。你可以通过 `ssh -X athena.dialup.mit.edu` 登录到公共 Athena 主机。我们在 Athena 上为你设置了适当的编译器和模拟器。要使用它们，请运行 `add -f 6.828`。你必须在每次登录时运行此命令（或将其添加到你的 `~/.environment` 文件中）。如果你在编译或运行 qemu 时遇到晦涩的错误，请检查你是否添加了课程锁存器。
获取 xv6 实验的 git 仓库源代码：
```bash
$ git clone git://g.csail.mit.edu/xv6-labs-2022
Cloning into 'xv6-labs-2022'...
...
$ cd xv6-labs-2022
```
仓库设置为在克隆仓库时检出 `util` 分支。
```bash
$ git status
On branch util
Your branch is up to date with 'origin/util'.

nothing to commit, working tree clean

```
`xv6-labs-2022` 仓库与书中的 `xv6-riscv` 略有不同；它主要添加了一些文件。如果你好奇，可以查看 git 日志：
```bash
$ git log
```
你将需要使用 Git 版本控制系统分发的文件来完成这个和后续的实验任务。对于每个实验，你将检出（`git checkout util`）一个为该实验定制的 xv6 版本。要了解更多关于 Git 的信息，请查看 Git 用户手册，或者你可能会发现这个面向计算机的 Git 概述很有用。Git 允许你跟踪对代码所做的更改。例如，如果你完成了其中一个练习，并且想要检查你的进度，你可以通过运行以下命令提交你的更改：
```bash
$ git commit -am 'my solution for util lab exercise 1'
Created commit 60d2135: my solution for util lab exercise 1
 1 files changed, 1 insertions(+), 0 deletions(-)
$
```
你可以使用 `git diff` 命令跟踪你的更改。运行 `git diff` 将显示自上次提交以来对代码的更改，而 `git diff origin/util` 将显示相对于初始 `util` 代码的更改。在这里，`origin/util` 是你为课程下载的初始代码的 git 分支名称。

构建并运行 xv6：
```bash
$ make qemu
riscv64-unknown-elf-gcc    -c -o kernel/entry.o kernel/entry.S
riscv64-unknown-elf-gcc -Wall -Werror -O -fno-omit-frame-pointer -ggdb -DSOL_UTIL -MD -mcmodel=medany -ffreestanding -fno-common -nostdlib -mno-relax -I. -fno-stack-protector -fno-pie -no-pie   -c -o kernel/start.o kernel/start.c
...
riscv64-unknown-elf-ld -z max-page-size=4096 -N -e main -Ttext 0 -o user/_zombie user/zombie.o user/ulib.o user/usys.o user/printf.o user/umalloc.o
riscv64-unknown-elf-objdump -S user/_zombie > user/zombie.asm
riscv64-unknown-elf-objdump -t user/_zombie | sed '1,/SYMBOL TABLE/d; s/ .* / /; /^$/d' > user/zombie.sym
mkfs/mkfs fs.img README  user/xargstest.sh user/_cat user/_echo user/_forktest user/_grep user/_init user/_kill user/_ln user/_ls user/_mkdir user/_rm user/_sh user/_stressfs user/_usertests user/_grind user/_wc user/_zombie
nmeta 46 (boot, super, log blocks 30 inode blocks 13, bitmap blocks 1) blocks 954 total 1000
balloc: first 591 blocks have been allocated
balloc: write bitmap block at sector 45
qemu-system-riscv64 -machine virt -bios none -kernel kernel/kernel -m 128M -smp 3 -nographic -drive file=fs.img,if=none,format=raw,id=x0 -device virtio-blk-device,drive=x0,bus=virtio-mmio-bus.0

xv6 kernel is booting

hart 2 starting
hart 1 starting
init: starting sh
$
```
如果你在提示符下输入 `ls`，你应该会看到类似以下的输出：
```bash
$ ls
.              1 1 1024
..             1 1 1024
README         2 2 2227
xargstest.sh   2 3 93
cat            2 4 32864
echo           2 5 31720
forktest       2 6 15856
grep           2 7 36240
init           2 8 32216
kill           2 9 31680
ln             2 10 31504
ls             2 11 34808
mkdir          2 12 31736
rm             2 13 31720
sh             2 14 54168
stressfs       2 15 32608
usertests      2 16 178800
grind          2 17 47528
wc             2 18 33816
zombie         2 19 31080
console        3 20 0
```
这些是 `mkfs` 包含在初始文件系统中的文件；大多数是你可以运行的程序。你刚刚运行了其中一个：`ls`。

xv6 没有 `ps` 命令，但是，如果你输入 `Ctrl-p`，内核将打印每个进程的信息。如果你现在尝试，你会看到两行：一行是 `init`，另一行是 `sh`。

要退出 qemu，请输入：`Ctrl-a x`（同时按下 `Ctrl` 和 `a`，然后按 `x`）。

评分和提交程序  
你可以运行 `make grade` 来使用评分程序测试你的解决方案。助教将使用相同的评分程序为你的实验提交评分。此外，我们还将为实验安排检查会议（见评分政策）。

实验代码附带了 GNU Make 规则，以简化提交过程。在提交实验的最终更改后，输入 `make handin` 以提交你的实验。有关如何提交的详细说明，请参见下文。

## sleep ([easy](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))

> [!important]
> 你需要在 xv6 中实现一个 UNIX 程序 `sleep`，该程序会暂停用户指定的时间（以 ticks 为单位）。ticks 是 xv6 内核定义的时间概念，即定时器芯片两次中断之间的时间。你的解决方案应该放在文件 `user/sleep.c` 中。
### 提示：

1. **阅读 xv6 书籍的第 1 章**：在开始编码之前，先阅读 xv6 书籍的第 1 章，了解 xv6 的基本概念和系统调用。
2. **参考其他用户程序**：查看 `user/` 目录下的其他程序（例如 `user/echo.c`、`user/grep.c` 和 `user/rm.c`），了解如何获取传递给程序的命令行参数。
3. **处理用户忘记传递参数的情况**：如果用户忘记传递参数，`sleep` 应该打印一条错误消息。
4. **将字符串转换为整数**：命令行参数以字符串形式传递；你可以使用 `atoi` 将其转换为整数（参见 `user/ulib.c`）。
5. **使用系统调用 `sleep`**：使用 `sleep` 系统调用。
6. **查看系统调用的实现**：查看 `kernel/sysproc.c` 中的 `sys_sleep` 函数，了解 `sleep` 系统调用在 xv6 内核中的实现；查看 `user/user.h` 中的 `sleep` 函数定义，了解如何在用户程序中调用 `sleep`；查看 `user/usys.S` 中的汇编代码，了解如何从用户代码跳转到内核代码执行 `sleep`。
7. **退出程序**：`main` 函数完成后应调用 `exit(0)`。
8. **将程序添加到 Makefile**：将你的 `sleep` 程序添加到 `Makefile` 中的 `UPROGS`；完成后，运行 `make qemu` 将编译你的程序，并且你可以在 xv6 shell 中运行它。
9. **学习 C 语言**：查看 Kernighan 和 Ritchie 的《C 程序设计语言》（第二版）（K&R），学习 C 语言。
### 运行程序：
```bash
$ make qemu
...
init: starting sh
$ sleep 10
(nothing happens for a little while)
$

```
如果你的程序如上所示运行时暂停，则你的解决方案是正确的。运行 `make grade` 查看你是否通过了 `sleep` 测试。

注意，`make grade` 会运行所有测试，包括下面任务的测试。如果你想运行特定任务的评分测试，可以输入：
```bash
$ ./grade-lab-util sleep
```
这将运行与 `sleep` 匹配的评分测试。或者，你可以输入：
```bash
$ make GRADEFLAGS=sleep grade
```
### 实验代码
```c
#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

int
main(int argc, char *argv[])

{
    int sleepTime ;
    if(argc < 2){
        fprintf(2, "Usage: sleep time...\n");
        exit(1);
    }
    sleepTime = atoi(argv[1]);
    sleep(sleepTime);
    return 0;

}
```
## pingpong ([easy](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))

> [!important]
> 编写一个使用 UNIX 系统调用通过一对管道在两个进程之间进行“乒乓”字节交换的程序。父进程应向子进程发送一个字节；子进程应打印“pid: received ping”，其中 pid 是它的进程 ID，将字节写入管道发送给父进程，然后退出；父进程应从子进程读取字节，打印“pid: received pong”，然后退出。你的解决方案应放在文件 `user/pingpong.c` 中。
> 
### 提示
1. **使用 `pipe` 创建管道**。
2. **使用 `fork` 创建子进程**。
3. **使用 `read` 从管道读取数据，使用 `write` 向管道写入数据**。
4. **使用 `getpid` 获取调用进程的进程 ID**。
5. **将程序添加到 `Makefile` 中的 `UPROGS`**。
6. **xv6 上的用户程序可用的库函数有限**。你可以在 `user/user.h` 中查看列表；源代码（系统调用除外）在 `user/ulib.c`、`user/printf.c` 和 `user/umalloc.c` 中。
### 运行程序：
```bash
$ make qemu
...
init: starting sh
$ pingpong
4: received ping
3: received pong
$
```
如果你的程序在两个进程之间交换字节并产生如上所示的输出，则你的解决方案是正确的。
### 实验代码
```c
#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"
 
int
main(int argc, char *argv[]){
    int p[2];
    pipe(p);
    if(fork() == 0) { //子进程
        int cpid = getpid();
        char *crevice[4];
        read(p[0],crevice,4);
        printf("<%d>:received %s \n",cpid,crevice);
        close(p[0]);
        write(p[1], "pong", 4);
        close(p[1]);
        exit(0);
    }else{ //父进程
        int pid = getpid();
        write(p[1], "ping", 4);
        close(p[1]);
        wait(0);
        char *revice[4];
        read(p[0],revice,4);
        printf("<%d>:received %s \n",pid,revice);
        close(p[0]);
    }
    return 0;
}
```

## primes ([moderate](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))/([hard](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))

编写一个使用管道实现并发素数筛的程序。这个想法归功于 Unix 管道的发明者 Doug McIlroy。页面中间的图片和周围的文字解释了如何实现它。你的解决方案应放在文件 `user/primes.c` 中。

你的目标是使用 `pipe` 和 `fork` 设置管道。第一个进程将数字 2 到 35 输入到管道中。对于每个素数，你将安排创建一个进程，该进程通过管道从其左邻居读取数据，并通过另一个管道向其右邻居写入数据。由于 xv6 的文件描述符和进程数量有限，第一个进程可以在 35 处停止。

### 提示：

1. **关闭不需要的文件描述符**：确保关闭进程不需要的文件描述符，否则你的程序会在第一个进程达到 35 之前耗尽 xv6 的资源。
2. **等待整个管道终止**：一旦第一个进程达到 35，它应该等待整个管道终止，包括所有子进程、孙进程等。因此，主 `primes` 进程应该只在所有输出都被打印并且所有其他 `primes` 进程都退出后才退出。
3. **提示**：当管道的写端关闭时，`read` 返回零。
4. **直接写入 32 位整数**：最简单的方法是直接将 32 位（4 字节）整数写入管道，而不是使用格式化的 ASCII I/O。
5. **按需创建进程**：你应该只在需要时创建管道中的进程。
6. **将程序添加到 `Makefile` 中的 `UPROGS`**。

### 运行程序：
```bash
$ make qemu
...
init: starting sh
$ primes
prime 2
prime 3
prime 5
prime 7
prime 11
prime 13
prime 17
prime 19
prime 23
prime 29
prime 31
$

```

如果你的程序实现了基于管道的筛法并产生如上所示的输出，则你的解决方案是正确的。

### 实验代码
```c
#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

void sieve(int left_pipe[2]) {
    int prime;
    int right_pipe[2];
    int number;

    // 从左邻居读取第一个数，这是当前的素数
    if (read(left_pipe[0], &prime, sizeof(prime)) == sizeof(prime)) {
        printf("prime %d\n", prime);
        // 创建右邻居的管道
        pipe(right_pipe);
        if (fork() == 0) {
            // 子进程：关闭左邻居的读端和右邻居的写端
            close(left_pipe[0]);
            close(right_pipe[1]);
            // 递归调用 sieve 处理右邻居
            sieve(right_pipe);
        } else {
            // 父进程：关闭右邻居的读端
            close(right_pipe[0]);
            // 读取左邻居的剩余数，过滤掉能被当前素数整除的数
            while (read(left_pipe[0], &number, sizeof(number)) == sizeof(number)) {
                if (number % prime != 0) {
                    write(right_pipe[1], &number, sizeof(number));
                }
            }
            // 关闭右邻居的写端和左邻居的读端
            close(right_pipe[1]);
            close(left_pipe[0]);
            // 等待子进程结束
            wait(0);
        }
    }
}

int main(int argc, char *argv[]) {
    int pipefd[2];
    // 创建初始管道
    pipe(pipefd);
    if (fork() == 0) {
        // 子进程：关闭管道的写端
        close(pipefd[1]);
        // 开始筛法
        sieve(pipefd);
    } else {
        // 父进程：关闭管道的读端
        close(pipefd[0]);
        // 将数字 2 到 35 写入管道
        for (int i = 2; i <= 35; i++) {
            write(pipefd[1], &i, sizeof(i));
        }
        // 关闭管道的写端
        close(pipefd[1]);
        // 等待子进程结束
        wait(0);
    }
    exit(0);
}

```

## find ([moderate](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))
 编写一个简单的 UNIX `find` 程序版本：查找目录树中具有特定名称的所有文件。你的解决方案应放在文件 `user/find.c` 中。
### 提示：

1. **查看 `user/ls.c` 以了解如何读取目录**。
2. **使用递归来允许 `find` 进入子目录**。
3. **不要递归进入 `.` 和 `..`**。
4. **文件系统的更改在 qemu 运行之间是持久的；要获得干净的文件系统，请运行 `make clean` 然后 `make qemu`**。
5. **你需要使用 C 字符串**。可以查看 K&R（C 语言书籍），例如第 5.5 节。
6. **注意 `==` 不能像在 Python 中那样比较字符串。请使用 `strcmp()`**。
7. **将程序添加到 `Makefile` 中的 `UPROGS`**。

### 运行程序：
```bash
$ make qemu
...
init: starting sh
$ echo > b
$ mkdir a
$ echo > a/b
$ mkdir a/aa
$ echo > a/aa/b
$ find . b
./b
./a/b
./a/aa/b
$
```
### 实验代码
```c
#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"
#include "kernel/fs.h"

  

//此fmtname 只保留最后完整路径的最后一个/后的文件或者目录名
char*
fmtname(char *path)
{
  char *p;
  // Find first character after last slash.
  for(p=path+strlen(path); p >= path && *p != '/'; p--)
    ;
  p++;
  return p;
}

//传入路径，以及要查找的文件名
void getDirList(char *path,char * target){

    char buf[512], *p;
    int fd;
    struct dirent de;
    struct stat st;
    if((fd = open(path, 0)) < 0){
        fprintf(2, "find: cannot open %s\n", path);
        return;
    }
    if(fstat(fd, &st) < 0){
        fprintf(2, "find: cannot stat %s\n", path);
        close(fd);
        return;
    }
    if(strlen(path) + 1 + DIRSIZ + 1 > sizeof buf){
      printf("ls: path too long\n");
    }
    strcpy(buf, path);
    p = buf+strlen(buf);
    *p++ = '/';
    //上面基本是从ls.c中原封不动抄来的
    //然后循环遍历传入目录中的文件和目录名
    //如果是文件，就检查是否是要查找的文件
    //如果是目录，就继续递归该目录查找其中的文件
    while(read(fd, &de, sizeof(de)) == sizeof(de)){
      if(de.inum == 0)
        continue;
      memmove(p, de.name, DIRSIZ);
      p[DIRSIZ] = 0;
      if(stat(buf, &st) < 0){
        printf("ls: cannot stat %s\n", buf);
        continue;
      }
      //排除 . 与 .. 这种隐藏目录
      if(strcmp(fmtname(buf),".")==0||strcmp(fmtname(buf),"..")==0){
        continue;
      }
      if(st.type==T_FILE){
        if(strcmp(fmtname(buf),target)==0){
          buf[strlen(buf)] = '\n';
          write(1, buf, strlen(buf)+1);
        }
      }else if(st.type==T_DIR){
        getDirList(buf,target);
      }
    }
    close(fd);
}

int main(int argc, char *argv[]){
  getDirList(argv[1],argv[2]);
  exit(0);
}
```

## xargs ([moderate](https://pdos.csail.mit.edu/6.S081/2022/labs/guidance.html))

> [!important]
> 编写一个简单的 UNIX `xargs` 程序版本：其参数描述要运行的命令，它从标准输入读取行，并为每一行运行该命令，将该行附加到命令的参数中。你的解决方案应放在文件 `user/xargs.c` 中。

### 示例：

```bash
$ echo hello too | xargs echo bye
bye hello too
$
```

注意，这里的命令是 `echo bye`，附加的参数是 `hello too`，因此命令变为 `echo bye hello too`，输出为 `bye hello too`。

请注意，UNIX 上的 `xargs` 会进行优化，一次将多个参数传递给命令。我们不期望你进行这种优化。为了使 `xargs` 在 UNIX 上按照我们希望的方式运行，请使用 `-n` 选项设置为 1 来运行它。例如：

```bash
$ (echo 1 ; echo 2) | xargs -n 1 echo
1
2
$
```

### 提示：

1. **使用 `fork` 和 `exec` 来为每一行输入调用命令**。在父进程中使用 `wait` 等待子进程完成命令。
2. **要读取单个输入行，逐个字符读取，直到出现换行符（`\n`）**。
3. **`kernel/param.h` 声明了 `MAXARG`，如果你需要声明一个 `argv` 数组，这可能会有用**。
4. **将程序添加到 `Makefile` 中的 `UPROGS`**。
5. **文件系统的更改在 qemu 运行之间是持久的；要获得干净的文件系统，请运行 `make clean` 然后 `make qemu`**。
6. **`xargs`、`find` 和 `grep` 结合得很好**：

```bash
$ find . b | xargs grep hello
```

将在当前目录及其子目录下名为 `b` 的每个文件上运行 `grep hello`。

#### 测试你的解决方案：

运行 shell 脚本 `xargstest.sh` 来测试你的 `xargs` 解决方案。如果你的解决方案正确，它将产生以下输出：

```bash
$ make qemu
...
init: starting sh
$ sh < xargstest.sh
$ $ $ $ $ $ hello
hello
hello
$ $
```
### 实验代码
```c
#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"
#include "kernel/fs.h"

  

char buf[512];
int
main(int argc, char *argv[])
{
    sleep(10);
    read(0,buf,sizeof(buf));
    char *xargv[16];
    int xargc = 0;
    //将xarg命令的参数复制到新的数组中
    for(int i=1;i<argc;i++){
        xargv[xargc] = argv[i];
        xargc++;
    }

    close(0);
    int start  = 0;
    for(int i=0;i<512;i++){
	    //从标准输入读入的数据，可能会以，以下几个标志被分割
	    //使用buf数组进行遍历时，进行判断
        if(buf[i]==' '|| buf[i]=='\n'||buf[i]=='\0'){
            //检测到分割以后，调用子进程进行exec执行。
            int pid = fork();
            if(pid >0){
                start = i+1;
                wait(0);
            } else {
	            //判断一下参数的长度
                int len = i-start;
                //大于0是为了排除buf最后面为空的位置
                if(len > 0){
	                //创建一块内存用于复制参数
                    char *p = (char*)malloc(len + 1);
                    //复制参数
                    for(int j = start;j<i;j++){
                        p[j - start] = buf[j];
                    }
                    //设置结束位
                    p[len] = '\0';
                    //添加到参数数组
                    xargv[xargc] = p;
                    xargc++;
                    //执行命令
                    exec(xargv[0],xargv);
                }
                exit(0);
            }
        }
    }
    wait(0);
    exit(0);
}
```