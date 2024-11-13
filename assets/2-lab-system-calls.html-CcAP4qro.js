import{_ as l}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as c,o as t,c as o,a as s,e,b as r,d as n}from"./app-B1D_pfCX.js";const p={},i=n(`<h1 id="system-calls" tabindex="-1"><a class="header-anchor" href="#system-calls"><span>System Calls</span></a></h1><p>在上一个实验中，你使用系统调用编写了一些实用程序。在这个实验中，你将向 xv6 添加一些新的系统调用，这将帮助你理解它们的工作原理，并让你接触到 xv6 内核的一些内部机制。在后续的实验中，你将添加更多的系统调用。</p><div class="hint-container warning"><p class="hint-container-title">注意</p><p>开始编码之前，请阅读 xv6 书籍的第 2 章，以及第 4 章的第 4.3 节和第 4.4 节，并阅读相关的源文件：</p><ul><li>用户空间的系统调用代码 在 user/user.h 和 user/usys.pl 中。</li><li>内核空间的系统调用代码 在 kernel/syscall.h 和 kernel/syscall.c 中。</li><li>与进程相关的代码 在 kernel/proc.h 和 kernel/proc.c 中。</li></ul></div><p>开始实验，切换到 <code>syscall</code> 分支：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> fetch
$ <span class="token function">git</span> checkout syscall
$ <span class="token function">make</span> clean
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果你运行 <code>make grade</code>，你会看到评分脚本无法执行 <code>trace</code> 和 <code>sysinfotest</code>。你的任务是添加必要的系统调用和存根，使它们能够正常工作</p>`,6),d={id:"system-call-tracing-moderate",tabindex:"-1"},m={class:"header-anchor",href:"#system-call-tracing-moderate"},u={href:"https://pdos.csail.mit.edu/6.S081/2020/labs/guidance.html",target:"_blank",rel:"noopener noreferrer"},k=n(`<div class="hint-container important"><p class="hint-container-title">重要</p><p>在这个任务中，你将添加一个系统调用跟踪功能，这可能会在你调试后续实验时有所帮助。你将创建一个新的 <code>trace</code> 系统调用，用于控制跟踪。它应该接受一个参数，一个整数“掩码”，其位指定要跟踪哪些系统调用。例如，要跟踪 <code>fork</code> 系统调用，程序调用 <code>trace(1 &lt;&lt; SYS_fork)</code>，其中 <code>SYS_fork</code> 是 <code>kernel/syscall.h</code> 中的系统调用号。你需要修改 xv6 内核，以便在每个系统调用即将返回时，如果系统调用号在掩码中设置，则打印一行。该行应包含进程 ID、系统调用的名称和返回值；你不需要打印系统调用参数。<code>trace</code> 系统调用应为调用它的进程及其随后派生的任何子进程启用跟踪，但不应影响其他进程。</p></div><p>我们提供了一个用户级程序 <code>trace</code>，它可以在启用跟踪的情况下运行另一个程序（参见 <code>user/trace.c</code>）。当你完成后，你应该看到类似以下的输出：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>$ trace <span class="token number">32</span> <span class="token function">grep</span> hello README
<span class="token number">3</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">1023</span>
<span class="token number">3</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">966</span>
<span class="token number">3</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">70</span>
<span class="token number">3</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">0</span>
$
$ trace <span class="token number">2147483647</span> <span class="token function">grep</span> hello README
<span class="token number">4</span>: syscall trace -<span class="token operator">&gt;</span> <span class="token number">0</span>
<span class="token number">4</span>: syscall <span class="token builtin class-name">exec</span> -<span class="token operator">&gt;</span> <span class="token number">3</span>
<span class="token number">4</span>: syscall <span class="token function">open</span> -<span class="token operator">&gt;</span> <span class="token number">3</span>
<span class="token number">4</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">1023</span>
<span class="token number">4</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">966</span>
<span class="token number">4</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">70</span>
<span class="token number">4</span>: syscall <span class="token builtin class-name">read</span> -<span class="token operator">&gt;</span> <span class="token number">0</span>
<span class="token number">4</span>: syscall close -<span class="token operator">&gt;</span> <span class="token number">0</span>
$
$ <span class="token function">grep</span> hello README
$
$ trace <span class="token number">2</span> usertests forkforkfork
usertests starting
<span class="token builtin class-name">test</span> forkforkfork: <span class="token number">407</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">408</span>
<span class="token number">408</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">409</span>
<span class="token number">409</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">410</span>
<span class="token number">410</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">411</span>
<span class="token number">409</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">412</span>
<span class="token number">410</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">413</span>
<span class="token number">409</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">414</span>
<span class="token number">411</span>: syscall fork -<span class="token operator">&gt;</span> <span class="token number">415</span>
<span class="token punctuation">..</span>.
$
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在第一个示例中，<code>trace</code> 调用 <code>grep</code> 仅跟踪 <code>read</code> 系统调用。<code>32</code> 是 <code>1 &lt;&lt; SYS_read</code>。在第二个示例中，<code>trace</code> 运行 <code>grep</code> 时跟踪所有系统调用；<code>2147483647</code> 设置了所有 31 个低位。在第三个示例中，程序未被跟踪，因此没有打印跟踪输出。在第四个示例中，<code>usertests</code> 中 <code>forkforkfork</code> 测试的所有后代进程的 <code>fork</code> 系统调用正在被跟踪。如果你的程序的行为如上所示（尽管进程 ID 可能不同），则你的解决方案是正确的。</p><h3 id="一些提示" tabindex="-1"><a class="header-anchor" href="#一些提示"><span>一些提示：</span></a></h3><ol><li><p><strong>将 <code>$U/_trace</code> 添加到 <code>Makefile</code> 中的 <code>UPROGS</code></strong>。</p></li><li><p><strong>运行 <code>make qemu</code>，你会看到编译器无法编译 <code>user/trace.c</code>，因为用户空间的系统调用存根还不存在</strong>：向 <code>user/user.h</code> 添加系统调用的原型，向 <code>user/usys.pl</code> 添加存根，并向 <code>kernel/syscall.h</code> 添加系统调用号。<code>Makefile</code> 调用 <code>user/usys.pl</code> 脚本，该脚本生成 <code>user/usys.S</code>，即实际的系统调用存根，它们使用 RISC-V 的 <code>ecall</code> 指令过渡到内核。一旦你修复了编译问题，运行 <code>trace 32 grep hello README</code>；它将失败，因为你还没有在内核中实现系统调用。</p></li><li><p><strong>在 <code>kernel/sysproc.c</code> 中添加一个 <code>sys_trace()</code> 函数，通过在 <code>proc</code> 结构（参见 <code>kernel/proc.h</code>）中记住其参数来实现新的系统调用</strong>。用于从用户空间检索系统调用参数的函数在 <code>kernel/syscall.c</code> 中，你可以在 <code>kernel/sysproc.c</code> 中看到它们的使用示例。</p></li><li><p><strong>修改 <code>fork()</code>（参见 <code>kernel/proc.c</code>）以将跟踪掩码从父进程复制到子进程</strong>。</p></li><li><p><strong>修改 <code>kernel/syscall.c</code> 中的 <code>syscall()</code> 函数以打印跟踪输出</strong>。你需要添加一个系统调用名称数组来进行索引。</p></li></ol>`,6);function b(v,g){const a=c("ExternalLinkIcon");return t(),o("div",null,[i,s("h2",d,[s("a",m,[s("span",null,[e("System call tracing ("),s("a",u,[e("moderate"),r(a)]),e(")")])])]),k])}const f=l(p,[["render",b],["__file","2-lab-system-calls.html.vue"]]),_=JSON.parse(`{"path":"/cs-basics/os/6.S081/labs/2-lab-system-calls.html","title":"System Calls","lang":"zh-CN","frontmatter":{"icon":"code-bold","date":"2024-11-12T00:00:00.000Z","category":["操作系统"],"tags":["MIT","C","riscv","XV6"],"description":"System Calls 在上一个实验中，你使用系统调用编写了一些实用程序。在这个实验中，你将向 xv6 添加一些新的系统调用，这将帮助你理解它们的工作原理，并让你接触到 xv6 内核的一些内部机制。在后续的实验中，你将添加更多的系统调用。 注意 开始编码之前，请阅读 xv6 书籍的第 2 章，以及第 4 章的第 4.3 节和第 4.4 节，并阅读相关...","head":[["meta",{"property":"og:url","content":"https://passerbyjia.github.io/cs-basics/os/6.S081/labs/2-lab-system-calls.html"}],["meta",{"property":"og:site_name","content":"Plus's NoteBook"}],["meta",{"property":"og:title","content":"System Calls"}],["meta",{"property":"og:description","content":"System Calls 在上一个实验中，你使用系统调用编写了一些实用程序。在这个实验中，你将向 xv6 添加一些新的系统调用，这将帮助你理解它们的工作原理，并让你接触到 xv6 内核的一些内部机制。在后续的实验中，你将添加更多的系统调用。 注意 开始编码之前，请阅读 xv6 书籍的第 2 章，以及第 4 章的第 4.3 节和第 4.4 节，并阅读相关..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-11-13T02:56:12.000Z"}],["meta",{"property":"article:author","content":"Plus"}],["meta",{"property":"article:tag","content":"MIT"}],["meta",{"property":"article:tag","content":"C"}],["meta",{"property":"article:tag","content":"riscv"}],["meta",{"property":"article:tag","content":"XV6"}],["meta",{"property":"article:published_time","content":"2024-11-12T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-11-13T02:56:12.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"System Calls\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-11-12T00:00:00.000Z\\",\\"dateModified\\":\\"2024-11-13T02:56:12.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Plus\\",\\"url\\":\\"https://passerbyjia.github.io\\"}]}"]]},"headers":[{"level":2,"title":"System call tracing (moderate)","slug":"system-call-tracing-moderate","link":"#system-call-tracing-moderate","children":[{"level":3,"title":"一些提示：","slug":"一些提示","link":"#一些提示","children":[]}]}],"git":{"createdTime":1731466572000,"updatedTime":1731466572000,"contributors":[{"name":"jh_personal@163.com","email":"jh_personal@163.com","commits":1}]},"readingTime":{"minutes":3.54,"words":1062},"filePathRelative":"cs-basics/os/6.S081/labs/2-lab-system-calls.md","localizedDate":"2024年11月12日","excerpt":"\\n<p>在上一个实验中，你使用系统调用编写了一些实用程序。在这个实验中，你将向 xv6 添加一些新的系统调用，这将帮助你理解它们的工作原理，并让你接触到 xv6 内核的一些内部机制。在后续的实验中，你将添加更多的系统调用。</p>\\n<div class=\\"hint-container warning\\">\\n<p class=\\"hint-container-title\\">注意</p>\\n<p>开始编码之前，请阅读 xv6 书籍的第 2 章，以及第 4 章的第 4.3 节和第 4.4 节，并阅读相关的源文件：</p>\\n<ul>\\n<li>用户空间的系统调用代码 在 user/user.h 和 user/usys.pl 中。</li>\\n<li>内核空间的系统调用代码 在 kernel/syscall.h 和 kernel/syscall.c 中。</li>\\n<li>与进程相关的代码 在 kernel/proc.h 和 kernel/proc.c 中。</li>\\n</ul>\\n</div>","autoDesc":true}`);export{f as comp,_ as data};
