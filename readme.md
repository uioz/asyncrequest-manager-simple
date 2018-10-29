# 简介

**注意**:个人项目不保证稳定性.

这是一个Node模块.

这个项目是一个简单的页面爬虫框架,虽然我称之为`框架`但是实际上也就算是个小工具,能够将简单的页面爬取`动作`进行切割管理.

简单的来说他使用策略模式将一次或者多次爬取一个固定的任务视为一种策略(一个函数).

该模块可以将多个策略进行组合并提供一些常见的页面爬取需求的支持.

- 不依赖请求模块 - 这部分由你决定
- 不依赖node - 内部没有使用任何node模块
- 内部执行均是异步
- 策略函数递归
- 策略函数并发
- 备选策略支持
- 请求配置式
- 十分少量的代码?(大概吧)
- 使用TypeScript进行编写

## 这个想法是怎么来的

假设有这么一个链接`www.xxx.com`这是一个门户网站,在网站的左侧有一个热门搜索排行榜.

我们想爬取该排行榜然后获取里面的内容然后组成一个数据结构返回,这一次的任务就完成了,我希望爬去完成后返回数据格式如下:
```
{
    'xxx':'xxxx',
    'xxx':'xxxx'
    ...
}
```
键是热门搜索的标题,而值就是对应链接中的正文.

也就是说我们有两个步骤:
1. 获取首页中的所有由热门搜索构成的键
2. 获取对应键中链接中的正文

没错实际上每个步骤就是一个策略,而这些策略是可以进行组合的,你可以想的到一个列表中前后顺序的组合.

实际上我们只有两个问题:
1. 策略函数之间的通信
2. 最后结果挂载的位置

没错本模块就是围绕这这个功能的实现还提供了一系列的周边功能.

### 策略函数通信基本规则

在模块执行的时候,会按照指定的顺序将多个策略函数的名字放到一个数组中,然后从第一个函数一直执行到最后一个函数.

## 策略函数长什么样

基本格式如下:
```
const stragegyFun1 = async function (handle, inf) { // 这里有两个钩子参数

    await timeOutPro();// 模拟的异步操作

    return {};// 返回一个结果
};
```

## 策略函数的约定

- 策略函数必须返回Promise,你可以使用ES7的`Async`来简化代码.
- - 策略函数必须要有返回值,当前的返回值就是下一个策略函数的参数对象,如果没有参数就返回一个空对象,如果下一个策略函数还需要当前的参数那么就将当前的参数对象返回.

### 简单的例子

现在我们来定义策略函数用于实现上面提到的第一个功能:(伪代码)
```
async function fun1() {

    const request = require('request');

    const result = request('www.xxx.com');
    // result = ['xxx','xx','xxx'...] 假设我们获取到了文章标题到了一个数组中

}
```

问题来了我们该如何与下一个策略函数`交互`呢?很简单把值返回就可以了,这里的返回值要求返回一个`对象`,这个对象会传递给下一个函数:(伪代码)
```
async function fun1() {

    const request = require('request');

    const result = request('www.xxx.com');
    // result = ['xxx','xx','xxx'...] 文章标题

    let a = {};

    for (const key of result) {

        a[key] = '';

    }

    return a;

}
```

定义第二个策略函数获取内容,在这个函数的第一个参数中有一个`arguments`属性就是上一个函数的返回值:(伪代码)
```
async function fun2(handle) {

    let keys = Object.keys(handle.arguments);

    const request = require('request');

    const result = request('www.xxx.com',keys);
    // result = {'xxx':'xxxx','xx':'xxxx'...}

}

```
遇到第二个问题了如何获取最后的结果?

很简单策略函数的第一个参数还提供了一个钩子参数`getResult`他返回一个对象而这个对象就是我们最终返回的结果,我们只需要将结果挂载在这个对象上就可以了:
```
async function fun2(handle) {

    let keys = Object.keys(handle.arguments);

    const request = require('request');

    const result = request('www.xxx.com',keys);
    // result = {'xxx':'xxxx','xx':'xxxx'...}

    handle.getResult().result = result;
}
```

**总结**:在getResult返回的对象上挂载属性是最终我们模块返回的结果(虽然还没有讲API),`return`返回的内容会被挂载在下一个策略函数参数的`arguments`属性上.

## API一览

导入:
```
const { AsyncRequestManagerSimple } = require('./dist/asyncrequest-manager-simple.js');

const AsyncRequestManager = new AsyncRequestManagerSimple();
```

- 方法一览
  - registerStragegy 注册策略函数
  - registerStragegyTree　注册一组策略函数
  - use 注册配置
  - execute 执行指定的配置
  - fastBoot 快速执行模式

## 更多钩子更多特性

在详解他到底api长啥样之前我想给你介绍他的所有钩子,也就是第一个参数中的所有你需要知道的内容.

可能你也猜到了后续的参数中也会有其他的东西,是的第二个参数中也有其他东西,但是没有第一个重要.

我们先来看看第一个参数中的定义:
```
interface StragegyHandle {
    /**
     * 上个策略组传入的参数
     */
    arguments: object;
    /**
     * 要求停止进行递归的钩子
     * 
     * 拥有该钩子意味着当前执行已经进入了递归模式.
     * 调用该钩子则停止递归.
     * 此时return(async)或者resolve(Promise)的值将交由下一个策略函数
     */
    stopRecursion: (() => void)|false;
    /**
     * 要求当前策略函数进行递归调用.
     * 
     * reutrn(async)或者resolve(Promise)返回的值将会传入下一次自己的递归调用中.
     * 在递归过程调用该函数无效.
     */
    recursion: () => void;
    /**
     * 要求下一个策略函数进行并发
     * 
     * return(async)或者resolve(Promise)的时候提供一个数组.
     * 数组的长度会被当做下一个策略函数的并发数量而数组的每一个内容都会被当做一个参数传入到对应的并发函数钩子的参数中.
     */
    concurrency: () => void;
    /**
     * 调用该函数后则会停止这个策略函数,返回的结果也会抛弃.
     * 
     * 如果调用该方法的策略函数挂载的策略图上tryError属性为true则不会报错.
     * 会跳过这个策略函数,并且执行他的替代任务图如果有的话.
     * 
     * - 参数
     *   - message 抛出错误的信息,默认信息Custom Error
     */
    fail:(message:string)=>void;
    /**
     * 获取作为结果的对象,可以为其挂载任何属性
     * 
     * **注意**:一旦调用recursion或concurrency或fail钩子后就只会返回false
     */
    getResult:()=>object|false;
    /**
     * 设置一个结果会覆盖原有的结果
     */
    setResult:(data:any)=>void;
}
```

这里有三个特殊的钩子函数:
- recursion 调用该钩子就会递归这个策略函数`自身`直到在调用stopRecursion钩子
- concurrency 调用该钩子就会让`下一个`策略函数并发
  - 进入并发状态的策略函数依然可以调用这个钩子,他会让下一个策略函数继续并发
- fail 无论什么时候这都是你最后的选项,一但调用参数钩子上的所有内容都会被锁住,无论什么模式下的返回值都会抛弃,调用他意味着你放弃了本次的请求.
  - 对于并发函数只要有一个调用了这个钩子则整个请求视为失败
  - 一旦调用了`fail`后这次的返回值会被抛弃如果使用了`tryError`(后续再讲)选项则会将本次传入的参数传给下一个策略函数

**注意**:`recursion`和`concurrency`和`fail`乃至`stopRecursion`都是只能调用一次的,我的意思是他只在第一次起作用,后续的调用是无效的.

**注意**:并发模式不建议返回内容但是可以返回空对象,或者将数据挂载在`getResult`返回的对象上,如果你执意要返回也是可以不过我这里提供一下合并的算法:
```
Object.assign({}, ...resultCollection);// resultCollection中保存着所有并发请求返回的结果
```
**注意**:在策略函数中执行错误或者手动抛出一个错误和调用`fail`钩子基本是等价的.

## 快速请求模式

这里只有简单的介绍,一个相当易懂的例子在`./test/fastboot.js`中.

快速模式不需要指定各种配置,只需要传入几个符合约定的策略函数就可以执行,最后返回一个`Promise`,`then`方法中包含着返回的结果.

## 配置式

我们可以给一个策略函数起一个名字,并且利用域名(建议)进行区分.

总的来说我们有两种方式进行注册策略函数:
- 一次注册一个
- 一次注册多个

对应的api就是
- registerStragegy(hostName,stragegyName,stragegyFun)
  - hostName 挂载的域名
  - stragegyName 策略函数的名称
  - stragegyFun 策略函数
- registerStragegyTree(tree)
  - tree 由多个策略函数组成的树

例子一次注册多个:
```
registerStragegyTree({
    www.google.com:{
        test:async ()=>xxxx,
        test1:async ()=>xxx
    }
})
```

接下来我们利用已经注册好的策略函数将他们组合成一个`配置`.

这里只有一个api:
- use(runningDiagram)
  - 一种数据结构存储在模块内部是用于发起请求的配置

这里只有两个简单的配置项:
- runningDiagram 被用于请求的实际配置
  - hostName 这个配置所属的域名
  - RunningDiagramName 这个配置的名称
  - baseUrl 基础url
  - diagrams 策略组

- diagrams 这里定义了一个策略函数的具体执行方法
  - stragegyName 所使用策略函数的名字
  - runningDiagramGroup 可选的参数,由备选的配置名字组合的数组
  - tryError 可选的参数,当值为`true`的时候请求失败不会报错而是继续执行

那么有了配置后最糟糕的情况就是:
1. 执行第一个策略函数(出错)
2. 顺序执行备选配置(出错)
3. 使用tryError = true 执行下一个策略函数

使用配置有很多优点,例如我们可以定义备用配置,无论是一个普通的策略函数还是递归策略函数还是并发策略函数,当他们失败的时候会先查找`备选配置`利用备选配置来完成这个动作.

而且即使你没有提供一个备选策略,依然可以利用`tryError`选项跳过这次失败的策略函数执行下一个策略函数.

这里要提及一下的就是策略函数的第二个参数它是一个对象上面一用有三个属性:
- hostName 这张图所属的域名
- baseUrl 基础url
- diagramName 策略函数的名称

**注意**:在`runningDiagram`指定策略函数的域名必须和`runningDiagram`的域名相同.

## 备选模式

当一个配置被当做了备选配置的时候,他和一个用于获取结果的配置还是有区别的:

__当配置当做备选配置的时候他本身就被视为了一个巨大的策略函数__

- 相同点
  - 执行机制和普通的配置完全一样
- 不同点
  - 内部`getResult`返回的`result`对象就是原来主配置中的内容,一旦修改主配置就被修改
  - 第一个策略函数会获取到失败的策略函数相同的参数
  - 最后一个策略函数需要有返回值,且它的返回值将会交由主配置中的下一个策略函数中

## 测试&和快速起手

提供了几个简单的测试文件可以用于快速的起手.

在`test`文件夹内一共有三个测试文件:
- recursion 递归测试
- concurrency 并发测试
- groupAndErrorTest 并发情况下使用备选组和拦截错误测试

执行:
```
npm run test
```
则会运行`groupAndErrorTest`这个测试.
