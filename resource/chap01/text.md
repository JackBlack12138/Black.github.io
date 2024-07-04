## 程序执行

很多人在学习C语言时，都是从一个简单的`hello.c`程序开始：

```c
// hello.c
#include<stdio.h>

#define MAX(a,b) a>b?a:b 

int main(){
    //print Hello World
	printf("Hello World\n");
    //print MAX(2,3)
    printf("%d\n",MAX(2,3));
	return 0;
}
```

通常我们在集成开发环境（IDE）中运行这样一个C程序时，往往只需要点击一个运行的按钮，程序便会开始执行：

```shell
Hello World
3
```

但计算机无法直接执行高级语言编写的程序，一个C程序必须编译成二进制可执行文件才能在机器上运行。在命令行中，我们可以使用编译器将C程序编译成可执行文件再运行，以`gcc`为例：

```shell
$ gcc hello.c
$ ./a.out 
Hello World
3
```

事实上，一个简单的`gcc hello.c`命令背后包含了一系列的步骤。一个C程序到可执行文件的过程可大致分为预处理（Prepressing）、编译（Compilation）、汇编（Assembly）和链接（Linking）四个阶段，如图所示：

<img src="resource/chap01/pictures/compile_pipeline.png" alt="Compile Pipeline" width="600" height="500">

现代IDE或者编译器提供的默认配置、编译和链接参数虽然能简化我们日常的程序开发，但在这样的开发中，我们常常会被这些集成工具提供的强大功能所迷惑。对程序很多莫名奇妙的错误无所适从，对程序运行时的性能瓶颈也束手无策。集成工具对程序运行背后的机制和机理的掩盖是我们无法看清这些问题的本质，而只有深入理解程序执行背后的每一个步骤，我们才能更游刃有余地应对开发中可能遇到的各种问题。

## 编译流程

上一小结提到，程序的执行大致可分为预处理、编译、汇编和链接四个阶段。在这一小结中，我们将更深入地去讨论在每一个阶段中计算机如何将一个C程序一步步处理成一个可执行的二进制文件。

### 预处理

​	预处理是整个编译过程的第一步。预处理的输入是源代码`*.c`和头文件`*.h`，输出文件是`*.i`。

​	在预处理过程中，预处理器会分析预处理指令。预处理器将`#include`的头文件内容复制到`*.c`中，如果`*.h`文件中还有`**.h`文件，就递归展开。如果`*.c`中有`#define`宏定义，也会在预处理阶段完成文本替换。此外，预处理阶段还会去除掉源代码中的注释。

​	我们可以通过`gcc -E`命令在或者直接调用`cpp`预处理器来对`hello.c`进行预处理：

```shell
$ gcc -E hello.c -o hello.i
# 或者直接调用cpp
$ cpp hello.c -o hello.i
```

​	上述命令中：`gcc -E`是让编译器在预处理之后就退出，不进行后续的编译过程。`-o hello.i`则是指定生成的文件名为`hello.i`。

​	由于头文件的展开，`hello.i`会比`hello.c`多出很多代码，`hello.i`部分内容如下：

```c
# 0 "hello.c"
# 0 "<built-in>"
# 0 "<command-line>"
# 1 "/usr/include/stdc-predef.h" 1 3 4
# 0 "<command-line>" 2
# 1 "hello.c"

# 1 "/usr/include/stdio.h" 1 3 4
# 27 "/usr/include/stdio.h" 3 4

	.......
    
typedef unsigned char __u_char;
typedef unsigned short int __u_short;
typedef unsigned int __u_int;
typedef unsigned long int __u_long;

	......
        
# 6 "hello.c"
int main(){

 printf("Hello World\n");

    printf("%d\n",2>3?2:3);
 return 0;
}
```

​	在上述`hello.i`片段的第8行，原本`hello.c`中的`stdio.h`被拓展成其具体路径`/usr/include/stdio.h`。第8行最前面的`# 1`表示接下来`hello.i`中的内容的起始位置对应`stdio.h`的第一行。同样的，上述片段中第20行的`# 6 "hello.c"`代表接下来的内容起始位置对应`hello.c`文件的第六行，即`main`函数的位置。对于编译器来说，这些信息都是必要的，因为在预处理过后源文件的代码位置已经发生变化，编译器需要依赖这些信息以追溯代码到原始`.c`文件的位置，方便后续调试等操作。

​	除此之外可以看到，源代码中`prinf`函数内的`MAX(2,3)`已经被替换为`2>3?2:3`，且源代码中的注释都未能在`hello.i`中保留。

### 编译

​	编译过程的输入文件是预处理后的文件`*.i`，输出文件是汇编文件`*.s`。

​	编译过程是把预处理完的文件进行一系列词法分析、语法分析、语义分析以及优化后生成相对应的汇编代码。这个过程往往是整个程序构建的核心部分，也是最复杂的部分之一。

​	编译的命令如下：

```shell
$ gcc -S hello.c -o hello.s
```

​	与预处理过程类似，`gcc -S`是让编译器在进行编译后就停止，不进行后续的汇编等过程。

​	也可以直接调用cc1来完成编译，cc1具体路径根据机器不同略有差别。

```shell
$ /usr/lib/gcc/x86_64-linux-gnu/11/cc1 hello.i -o hello.s
 main
Analyzing compilation unit
Performing interprocedural optimizations
 <*free_lang_data> {heap 904k} <visibility> {heap 904k} <build_ssa_passes> {heap 904k} <opt_local_passes> {heap 1036k} <remove_symbols> {heap 1036k} <targetclone> {heap 1036k} <free-fnsummary> {heap 1036k}Streaming LTO
 <whole-program> {heap 1036k} <fnsummary> {heap 1036k} <inline> {heap 1036k} <modref> {heap 1036k} <free-fnsummary> {heap 1036k} <single-use> {heap 1036k} <comdats> {heap 1036k}Assembling functions:
 <simdclone> {heap 1036k} main
Time variable                                   usr           sys          wall           GGC
 phase setup                        :   0.00 (  0%)   0.00 (  0%)   0.00 (  0%)  1298k ( 74%)
 phase opt and generate             :   0.01 (100%)   0.00 (  0%)   0.01 (100%)    61k (  4%)
 tree CFG construction              :   0.00 (  0%)   0.00 (  0%)   0.01 (100%)  1416  (  0%)
 integrated RA                      :   0.01 (100%)   0.00 (  0%)   0.00 (  0%)    24k (  1%)
 TOTAL                              :   0.01          0.00          0.01         1748k
```

​	上述两种方式都可以得到汇编文件`*.s`。汇编语言是二进制指令的文本形式，与二进制指令是一一对应的关系。只要还原成二进制，汇编语言就可以被 CPU 直接执行，所以它是最底层的可读的低级语言。

​	编译得到的`hello.s`汇编文件内容如下：

```asm
	.file	"hello.i"
	.text
	.section	.rodata
.LC0:
	.string	"Hello World"
.LC1:
	.string	"%d\n"
	.text
	.globl	main
	.type	main, @function
main:
.LFB0:
	.cfi_startproc
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register 6
	leaq	.LC0(%rip), %rax
	movq	%rax, %rdi
	call	puts@PLT
	movl	$3, %esi
	leaq	.LC1(%rip), %rax
	movq	%rax, %rdi
	movl	$0, %eax
	call	printf@PLT
	movl	$0, %eax
	popq	%rbp
	.cfi_def_cfa 7, 8
	ret
	.cfi_endproc
.LFE0:
	.size	main, .-main
	.ident	"GCC: (Ubuntu 11.3.0-1ubuntu1~22.04) 11.3.0"
	.section	.note.GNU-stack,"",@progbits

```

​	汇编程序中以`.`开头的名称并不是指令的助记符，不会被翻译成机器指令，而是给汇编器一些特殊指示，称为汇编指示（Assembler Directive）或伪操作（Pseudo-operation），由于它不是真正的指令所以加个“伪”字。

​	以上述的`hello.s`为例：

* `.file`指示源文件名为`hello.i`；

* `.text`代表接下来的内容为代码段；
* `.section`指示把代码划分成若干个段；

* `.rodata`代表接下来的内容为只读数据段；

* `.LC0`是一个助记符号，类似于C语言当中的变量名，`.`开头的变量为局部变量，只能在该文件中引用；

* `.string`是`.LC0`的类型，`"Hello World"`是其具体内容；

* `.globl	main`声明了一个全局符号`main`，`.type	main, @function`指定`main`为一个函数；

* `.cfi_xxx`均为基于CFI（Call Frame Information）规范生成的指令，用于生成有效的调试信息；

* `pushq`为`X86_64`架构的指令，用于将一个64位寄存器压入栈中，`movq	%rsp, %rbp`代表将`%rsp`寄存器中的64位值拷贝至`%rbp`中。

  其他汇编指令的具体含义在此不再赘述，感兴趣的同学可自行去了解。

### 汇编

​	汇编过程的输入是汇编文件`*.s`，输出是二进制目标文件`*.o`。

​	在汇编过程中，汇编器会将汇编代码转变成机器可以执行的指令，每一个汇编语句几乎都对应一条机器指令。所以汇编器的汇编过程相对于编译器来讲比较简单，它没有复杂的语法，也没有语义，也不需要做指令优化，只需要根据汇编指令和机器指令的对照表一一翻译就可以了。

​	汇编过程可以用如下的命令完成：

```shell
$ gcc -c hello.c -o hello.o
# 或者直接调用汇编器as
$ as hello.s -o hello.o
```

​	汇编生成的`*.o`目标文件为二进制文件，其内容可以用二进制查看器进行查看。以hello.o为例，其开头部分内容以16进制展示为：

```
7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00
01 00 3E 00 01 00 00 00 00 00 00 00 00 00 00 00
......
```

​	其中，前四个字节7F 、45、4C、46分别对应ASCII码的Del(删除)、字母E、字母L、字母F。这四个字节被称为ELF文件的魔数，操作系统在加载可执行文件时会确认魔数是否正确，如果不正确则拒绝加载。
​		第五个字节标识ELF文件是32位（01）还是64位（02）的。
​		第六个字节标识该ELF文件字节序是小端（01）还是大端（02）的。 
​		第七个字节指示ELF文件的版本号，一般是01。 
​		后九个字节ELF标准未做定义。一般为00。

​	此外，也可以使用`objdump`反汇编工具将查看`hello.o`的内容：

```shell
$ /hello$ objdump -d hello.o

hello.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <main>:
   0:   f3 0f 1e fa             endbr64 
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rax        # f <main+0xf>
   f:   48 89 c7                mov    %rax,%rdi
  12:   e8 00 00 00 00          call   17 <main+0x17>
  17:   be 03 00 00 00          mov    $0x3,%esi
  1c:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rax        # 23 <main+0x23>
  23:   48 89 c7                mov    %rax,%rdi
  26:   b8 00 00 00 00          mov    $0x0,%eax
  2b:   e8 00 00 00 00          call   30 <main+0x30>
  30:   b8 00 00 00 00          mov    $0x0,%eax
  35:   5d                      pop    %rbp
  36:   c3                      ret
```

​	`objdump -d`表示对代码段进行反汇编。不难看出，`hello.o`的内容大部分都是对`hello.s`中汇编指令的一一翻译。

​	汇编生成的目标文件`*.o`虽然是包含机器指令的二进制文件，但`*.o`并不是最终的可执行二进制文件，而仍是一种中间文件，目标文件仍然需要经过链接才能变成可执行文件。

### 链接

​	链接过程的输入是二进制目标文件`*.o`，以及相关二进制库等，输出为可执行文件。

​	前面的过程只是将我们自己写的代码变成了二进制形式，它还需要和系统组件（比如标准库、动态链接库等）结合起来，这些组件都是程序运行所必须的。链接其实就是一个“打包”的过程，它将所有二进制形式的目标文件`*.o`和系统组件组合成一个可执行文件。

​	链接过程可用如下命令完成：

```shell
$ gcc hello.o
```

​	链接后的可执行文件若不加`-o`进行重定向，则默认输出文件名为`a.out`。此时执行a.out，程序便可真正在机器上运行：

```shell
$ ./a.out 
Hello World
3
```

​	但其实在上面的`gcc hello.o`命令中，gcc同样在背后做了许多事情。包括自动寻找需要的系统组件并链接等等。

​	链接过程可以通过调用`ld`来进行：

```shell
$ ld hello.o
ld: warning: cannot find entry symbol _start; defaulting to 0000000000401000
ld: hello.o: in function `main':
hello.c:(.text+0x13): undefined reference to `puts'
ld: hello.c:(.text+0x2c): undefined reference to `printf'
```

​	若直接进行链接，`ld`会提示找不到`_start`符号，`_start`是程序运行的默认入口。通常情况下，`_start`会存在于某一个系统标准库中，程序也会在这个位置开始运行。但此处我们没有加任何其他系统标准库，所以`ld`自然找不到`_start`。

​	我们可以使用`-e`参数来指定程序入口，比如：

```shell
$ ld -e main  hello.o
ld: hello.o: in function `main':
hello.c:(.text+0x13): undefined reference to `puts'
ld: hello.c:(.text+0x2c): undefined reference to `printf'
```

​	这时`ld`不再提示找不到`_start`，因为我们已经手动把入口改为了`main`。但`ld`还说找不到`put`和`printf`。`put`和`printf`都是系统调用，同样在某个标准系统库中。`put`是比`printf`更简单的调用，对于简单的`printf`函数，如源代码中的`printf("Hello World\n");`只是简单地打印字符串，编译器就会将其优化为`put`。

​	现在我们在`hello.c`去掉所有的函数调用，只保留最简单的部分。理论上这能生成最简单的可执行文件

```
int main(){
	return 0;
}
```

​	生成目标二进制文件后，用`ld`指定运行入口进行链接：

```shell
$ gcc -c hello.c 
$ ld -e main  hello.o
```

​	此时`ld`不再报错，并且能成功生成可执行文件`a.out`。运行：

```shell
$./a.out
Segmentation fault (core dumped)
```

​	程序发生错误。这是因为在`main`函数中，`return 0`会将`0`返回给调用者。但我们将程序入口指定为`main()`函数，自然不存在调用者，程序也无法找到返回地址，故发生错误。事实上，一个正常的程序编译为可执行文件后，其最外层必须进行系统调用`exit`，程序才能正常退出，否则这个程序执行就会发生`Segementation Fault`。
