import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,d as t}from"./app-Dzwf5jQX.js";const p={},e=t(`<h1 id="xv6源码精读-proc-c" tabindex="-1"><a class="header-anchor" href="#xv6源码精读-proc-c"><span>XV6源码精读 -- proc.c</span></a></h1><h2 id="proc-pagetable-struct-proc-p" tabindex="-1"><a class="header-anchor" href="#proc-pagetable-struct-proc-p"><span>proc_pagetable(struct proc *p)</span></a></h2><p>此函数的作用是创建一个新的用户页表，并在其中映射跳板代码和陷阱帧页。这个函数通常用于操作系统内核中创建进程时初始化进程的页表。</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><pre class="language-c"><code><span class="token comment">// 创建给定进程的用户页表，没有用户内存，但有跳板和陷阱帧页。</span>
<span class="token class-name">pagetable_t</span>
<span class="token function">proc_pagetable</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">proc</span> <span class="token operator">*</span>p<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token class-name">pagetable_t</span> pagetable<span class="token punctuation">;</span>

  <span class="token comment">// 创建一个空白页表</span>
  pagetable <span class="token operator">=</span> <span class="token function">uvmcreate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">if</span><span class="token punctuation">(</span>pagetable <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>

  <span class="token comment">//将跳板代码(用于系统调用返回)映射到最高的用户地址</span>
  <span class="token comment">//只有内核使用该代码进出用户空间，所以不用设置PTE_U</span>
  <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token function">mappages</span><span class="token punctuation">(</span>pagetable<span class="token punctuation">,</span> TRAMPOLINE<span class="token punctuation">,</span> PGSIZE<span class="token punctuation">,</span>
              <span class="token punctuation">(</span>uint64<span class="token punctuation">)</span>trampoline<span class="token punctuation">,</span> PTE_R <span class="token operator">|</span> PTE_X<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token function">uvmfree</span><span class="token punctuation">(</span>pagetable<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 将陷阱帧页映射到跳板页的下方，用于 trampoline.S</span>
  <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token function">mappages</span><span class="token punctuation">(</span>pagetable<span class="token punctuation">,</span> TRAPFRAME<span class="token punctuation">,</span> PGSIZE<span class="token punctuation">,</span>
              <span class="token punctuation">(</span>uint64<span class="token punctuation">)</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>trapframe<span class="token punctuation">)</span><span class="token punctuation">,</span> PTE_R <span class="token operator">|</span> PTE_W<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token function">uvmunmap</span><span class="token punctuation">(</span>pagetable<span class="token punctuation">,</span> TRAMPOLINE<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">uvmfree</span><span class="token punctuation">(</span>pagetable<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">return</span> pagetable<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol><li><p><code>uvmcreate()</code> 定义于 <code>kernel/vm.c</code> 用于创建一个空白的页表</p></li><li><p><code>mappages(pagetable_t pagetable, uint64 va, uint64 size, uint64 pa, int perm)</code> 定义于 <code>kernel/vm.c</code></p><p>用于在操作系统内核中建立虚拟地址到物理地址的映射关系</p><p><code>pagetable</code>: 表示要操作的页表，它是一个指向页表的指针，用于存储虚拟地址和物理地址之间的映射关系。</p><p><code>va</code>: 虚拟地址，表示要进行映射的虚拟地址范围的起始地址。</p><p><code>size</code>: 表示要映射的虚拟地址范围的大小，以字节为单位。注意，这个大小可能不是页对齐的。</p><p><code>pa</code>: 物理地址，表示要映射的物理地址范围的起始地址。</p><p><code>perm</code>: 表示映射的权限，通常用于设置页表项中的权限位。常见的权限包括可读（PTE_R）、可写（PTE_W）、可执行（PTE_X）和用户态权限（PTE_U）等。</p></li><li><p><code>TRAMPOLINE</code>与<code>TRAPFRAME</code> 定义在 <code>memlayout.h</code> 中他们的逻辑地址是计算出来了的并且大小只有一个页面</p></li><li><p><code>trampoline</code>定义在汇编代码 <code>trampoline.S</code>中 跳板代码一开始存在于内核的代码段中，其物理地址与内核代码的物理地址相同。在操作系统启动时，内核会被加载到物理内存的某个位置，并且跳板代码也随之被加载到相应的物理地址处。</p></li></ol>`,5),c=[e];function o(l,u){return a(),s("div",null,c)}const k=n(p,[["render",o],["__file","xv6_1.html.vue"]]),d=JSON.parse(`{"path":"/cs-basics/os/6.S081/xv6/xv6_1.html","title":"XV6源码精读 -- proc.c","lang":"zh-CN","frontmatter":{"icon":"code-bold","date":"2024-05-07T00:00:00.000Z","category":["操作系统"],"tag":["MIT","XV6","riscv","C"],"description":"XV6源码精读 -- proc.c proc_pagetable(struct proc *p) 此函数的作用是创建一个新的用户页表，并在其中映射跳板代码和陷阱帧页。这个函数通常用于操作系统内核中创建进程时初始化进程的页表。 uvmcreate() 定义于 kernel/vm.c 用于创建一个空白的页表 mappages(pagetable_t pag...","head":[["meta",{"property":"og:url","content":"https://passerbyjia.github.io/cs-basics/os/6.S081/xv6/xv6_1.html"}],["meta",{"property":"og:site_name","content":"Plus's NoteBook"}],["meta",{"property":"og:title","content":"XV6源码精读 -- proc.c"}],["meta",{"property":"og:description","content":"XV6源码精读 -- proc.c proc_pagetable(struct proc *p) 此函数的作用是创建一个新的用户页表，并在其中映射跳板代码和陷阱帧页。这个函数通常用于操作系统内核中创建进程时初始化进程的页表。 uvmcreate() 定义于 kernel/vm.c 用于创建一个空白的页表 mappages(pagetable_t pag..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T12:42:24.000Z"}],["meta",{"property":"article:author","content":"Plus"}],["meta",{"property":"article:tag","content":"MIT"}],["meta",{"property":"article:tag","content":"XV6"}],["meta",{"property":"article:tag","content":"riscv"}],["meta",{"property":"article:tag","content":"C"}],["meta",{"property":"article:published_time","content":"2024-05-07T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T12:42:24.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"XV6源码精读 -- proc.c\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-05-07T00:00:00.000Z\\",\\"dateModified\\":\\"2024-05-08T12:42:24.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Plus\\",\\"url\\":\\"https://passerbyjia.github.io\\"}]}"]]},"headers":[{"level":2,"title":"proc_pagetable(struct proc *p)","slug":"proc-pagetable-struct-proc-p","link":"#proc-pagetable-struct-proc-p","children":[]}],"git":{"createdTime":1715145830000,"updatedTime":1715172144000,"contributors":[{"name":"JH","email":"jh_personal@163.com","commits":2}]},"readingTime":{"minutes":1.97,"words":592},"filePathRelative":"cs-basics/os/6.S081/xv6/xv6_1.md","localizedDate":"2024年5月7日","excerpt":"\\n<h2>proc_pagetable(struct proc *p)</h2>\\n<p>此函数的作用是创建一个新的用户页表，并在其中映射跳板代码和陷阱帧页。这个函数通常用于操作系统内核中创建进程时初始化进程的页表。</p>\\n<div class=\\"language-c\\" data-ext=\\"c\\" data-title=\\"c\\"><pre class=\\"language-c\\"><code><span class=\\"token comment\\">// 创建给定进程的用户页表，没有用户内存，但有跳板和陷阱帧页。</span>\\n<span class=\\"token class-name\\">pagetable_t</span>\\n<span class=\\"token function\\">proc_pagetable</span><span class=\\"token punctuation\\">(</span><span class=\\"token keyword\\">struct</span> <span class=\\"token class-name\\">proc</span> <span class=\\"token operator\\">*</span>p<span class=\\"token punctuation\\">)</span>\\n<span class=\\"token punctuation\\">{</span>\\n  <span class=\\"token class-name\\">pagetable_t</span> pagetable<span class=\\"token punctuation\\">;</span>\\n\\n  <span class=\\"token comment\\">// 创建一个空白页表</span>\\n  pagetable <span class=\\"token operator\\">=</span> <span class=\\"token function\\">uvmcreate</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n  <span class=\\"token keyword\\">if</span><span class=\\"token punctuation\\">(</span>pagetable <span class=\\"token operator\\">==</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span>\\n    <span class=\\"token keyword\\">return</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">;</span>\\n\\n  <span class=\\"token comment\\">//将跳板代码(用于系统调用返回)映射到最高的用户地址</span>\\n  <span class=\\"token comment\\">//只有内核使用该代码进出用户空间，所以不用设置PTE_U</span>\\n  <span class=\\"token keyword\\">if</span><span class=\\"token punctuation\\">(</span><span class=\\"token function\\">mappages</span><span class=\\"token punctuation\\">(</span>pagetable<span class=\\"token punctuation\\">,</span> TRAMPOLINE<span class=\\"token punctuation\\">,</span> PGSIZE<span class=\\"token punctuation\\">,</span>\\n              <span class=\\"token punctuation\\">(</span>uint64<span class=\\"token punctuation\\">)</span>trampoline<span class=\\"token punctuation\\">,</span> PTE_R <span class=\\"token operator\\">|</span> PTE_X<span class=\\"token punctuation\\">)</span> <span class=\\"token operator\\">&lt;</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">{</span>\\n    <span class=\\"token function\\">uvmfree</span><span class=\\"token punctuation\\">(</span>pagetable<span class=\\"token punctuation\\">,</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token keyword\\">return</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">;</span>\\n  <span class=\\"token punctuation\\">}</span>\\n\\n  <span class=\\"token comment\\">// 将陷阱帧页映射到跳板页的下方，用于 trampoline.S</span>\\n  <span class=\\"token keyword\\">if</span><span class=\\"token punctuation\\">(</span><span class=\\"token function\\">mappages</span><span class=\\"token punctuation\\">(</span>pagetable<span class=\\"token punctuation\\">,</span> TRAPFRAME<span class=\\"token punctuation\\">,</span> PGSIZE<span class=\\"token punctuation\\">,</span>\\n              <span class=\\"token punctuation\\">(</span>uint64<span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">(</span>p<span class=\\"token operator\\">-&gt;</span>trapframe<span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">,</span> PTE_R <span class=\\"token operator\\">|</span> PTE_W<span class=\\"token punctuation\\">)</span> <span class=\\"token operator\\">&lt;</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">{</span>\\n    <span class=\\"token function\\">uvmunmap</span><span class=\\"token punctuation\\">(</span>pagetable<span class=\\"token punctuation\\">,</span> TRAMPOLINE<span class=\\"token punctuation\\">,</span> <span class=\\"token number\\">1</span><span class=\\"token punctuation\\">,</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token function\\">uvmfree</span><span class=\\"token punctuation\\">(</span>pagetable<span class=\\"token punctuation\\">,</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token keyword\\">return</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">;</span>\\n  <span class=\\"token punctuation\\">}</span>\\n\\n  <span class=\\"token keyword\\">return</span> pagetable<span class=\\"token punctuation\\">;</span>\\n<span class=\\"token punctuation\\">}</span>\\n</code></pre></div>","autoDesc":true}`);export{k as comp,d as data};
