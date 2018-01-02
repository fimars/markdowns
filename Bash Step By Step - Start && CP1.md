## **Bash** Step By Step

> 翻译：Bash我TM社保 —— 某不愿意透露姓名的Ass We Can大佬(纯虚构)

### 缘由

这个月我原本是为了填一个MusicApp的坑，准备入Kotlin的。按照之前的经验，学习语言的初期刷题是一个对提高熟练度非常有帮助的方法，但是当我点开CW的语言分类的时候，我惊喜得发现有Bash这个shell。好“骑”心爆棚的我点进了Bash的题库随便点开了一道，然后就蒙住了。我对不起当年的系统课上的linux老师，对不起作业，我决定把Bash捡起来。（Kotlin呢，MusicApp呢？



### 起手式 

**Useful resources**

*PS: Mac only, Sorry for the proletariat.*

- [Update Bash In Mac By Brew](http://clubmate.fi/upgrade-to-bash-4-in-mac-os-x/)
- [配合iterm2的高亮](https://superuser.com/questions/399594/color-scheme-not-applied-in-iterm2)
- [Bash Guide](http://guide.bash.academy/) 目前在看的就是这个




## Bash Guide Notes 📒

阅读笔记

### The Chapter: Commands And Arguments

**预备知识:**

1. 指令块使用大括号包裹, `{ command1; command2 }`

2. Exec指令: 新开一个进程，代替现有的进程。具体可见 [Link](https://askubuntu.com/questions/525767/what-does-an-exec-command-do)

3. **FD, File Descriptor**

   bash中有一个蛮重要的概念——File Descriptor(后简称FD)，FD是bash程序和外界交互的一个抽象，常见的有FD0(标准输入)、FD1(标准输入)、FD2(标准Error)。可以参考下图：

   ![File Descriptor](http://guide.bash.academy/img/streams.png)



**可能会有用的情报:**

Bash会为每条`指令`创建一个`subshell`，这个会放在后面讲解





#### 小节: 基本语法(Syntax)

**Syntax**

1. `[ something ]` 指是可选的
2. `[ FORMAT ...]` 指重复多个这个格式是合法的

**Command**

> 基本形式:  `[环境变量 ...] 指令名 [参数 ...] [FD重定向 ...]`

**List 一串Commands**

> 基本形式 :  `command control-operator[ commadn2 control-operator ... ]`	

控制操作符包含  `|| && ;` `||`在前者执行失败的时候调用，`;`在前者执行结束之后调用, `&&`在前者执行成功之后调用

**Compound Command 混合Command**

> 基本形式:  `if list [ ;|<newline> ] then list [ ;|<newline> ] fi` 或 `{ list ; }`

**Coprocesses 异步Command**

> 基本形式:  `coproc [ name ] command [ redirection ... ]`

会在使用这个`$name`的时候去运行这个指令并拿到即时的结果

**Functions**

> 基本形式: `name () compound-command [ redirection ]`

()内没有参数，一直为空，拿参数直接用$1, $2即可。顺便说一下: `$$ - PID`, `$! - 后台PID`, `$? - exit code`, `$* - 参数列表 空格分割`, `$@ - 参数列表 回车分割`, `$# 参数个数`

**Pipeline**  

> 基本形式: `[time [-p]] [ ! ] command [ [|或|&] cmmand2 ... ]`

看个例子

```bash
$ echo Hello | rev
# output: olleH

$ rm doesntexistfile |& rev
# output: yrotcerid ro elif hcus oN :eliftsixetnseod :mr

$ time echo Hello
# output: Hello <newline><newline> echo 0m0.004s etc...

# ! 关键字暂时没有讨论到，待补充
```

`Pipeline`具体做的事情就是：把前一条指令的FD1,2，指向了下一跳指令的FD0;

且有`cm1 | cm2` ，`cm1 |& cm2`两种形式。第二种我还是第一次知道呢/doge



#### 小节: Simple commands

**Command**

指令名：Bash会根据 `指令名` 去查找 `已定义的fn` , `builtin-fn` 或 `$PATH` 里有的程序去执行，type可以查找指令的所在位置 —— `type command`。

参数：command后面的参数用空格分割，字符串中有空格用`"`, `'`包裹或者用`\`转义空格。字符串`""` 内可包裹变量`$variable` 或 命令`$(command)`

请务必留意引号的使用，有个危险的例子可以看看

```bash
$ read -p 'Which user would you like to remove from your system ?' username
# Something Print ...?  lucifa

$ rm -vr /home/$username
# Broken! this command will be:
# -> rm -vr /home/ lucifa
```

**Redirection! **

>  DING, 已获得情报如下：

1. `command >File` 可以把指令的FD1指向File

2. `command 2>File` 可以把指令的FD2指向File

3. `/dev ` 下存放的是直接指向系统设备的文件, `/dev/null` 则是其中一个特殊的存在，这个文件不管写，一直为空。可以把不在意的错误信息指向这个文件。

4. 当你很理所当然得使用如下操作时，其实情况非常危险⚠️

   ```bash
   $ ls -l a b >myfiles.ls 2>mayflies.ls
   # 理想状态应该是，把正常输入写到myfiles, 然后，把错误信息写到后面
   # 实际结果却如下
   # -rw-r--r--  1 lhunath  stls: b: No such file or directoryaff  0 30 Apr 14:43 a
   # 混乱的结果
   ```

   因为两个FD同时打开了这个文件流，所以导致混合的结果。正确的操作如下

   ```bash
   $ ls -l a b >myfiles.ls 2>&1
   # 使用 >& 操作符，让FD2指向FD1的文件流
   ```

5. `[x]>file, [x]<file` 指令的FD1指向文件，指令的FD0从文件输入

6. `[x]>&y 或 [x]<&y` 复制文件指向流，后者的使用场景还没看到, 但在SO某个问题中看到，前后两者的效果几乎一样 [Link](https://unix.stackexchange.com/questions/120532/what-does-exec-31-do)

7. `x>&-, x<&-` 用`-`去指向，即是关闭这个FD

8. `[x]>&y-, [x]<&y-`  是 `[x]>&y y>&-` 的语法糖

9. `[x]>>file` Appending 文件指向

10. `[x]&>file` 同时重定向FD1，FD2到File

11. `[x]<>file` 把FD0, FD1都指向一个文件

    ```bash
    $ exec 3>&1 >mylog; echo moo; exec 1>&3 3>&-
    # 这个地方先把当前进程的FD1 copy 到FD3来，然后把FD1指向一个文件
    # 接着来一发echo，等于是把输出值写到文件，最后结束的时候exec
    # 重新把FD1指回一开始的Display，把FD3抛弃掉
    ```

12. Here Documents

    ```
    command <<[-]分隔符(.)
    	Documents
    分隔符
    ```

    直接把分隔符内的内容传输给`指令`的FD0, 带上`-`就是忽略内容每行开头的空格。

13. Here Strings, 类似前一个，更精简一些，`<<<string `即可