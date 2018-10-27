"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
class Dispatchers {
    constructor(tools) {
        this.result = {};
        this.flag = {
            isRecursion: false,
            isConcurrent: false,
            isFail: false
        };
        this.handle = {
            arguments: {},
            stopRecursion: false,
            recursion: () => {
                if (this.flag.isFail || this.flag.isRecursion || this.flag.isConcurrent) {
                    return;
                }
                this.flag.isRecursion = true;
            },
            concurrency: () => {
                if (this.flag.isFail || this.flag.concurrency) {
                    return;
                }
                this.flag.isConcurrent = true;
            },
            fail: (message) => {
                if (this.flag.isFail) {
                    return;
                }
                this.flag.isConcurrent = this.flag.isRecursion = false;
                this.flag.isFail = true;
                throw new Error(message ? message : 'Custom Error');
            },
            getResult: () => {
                if (this.flag.isFail) {
                    return false;
                }
                return this.result;
            },
            setResult: (data) => {
                if (this.flag.isFail) {
                    return false;
                }
                this.result = data;
            }
        };
        // 挂载工具类
        this.tools = tools;
    }
    /**
     * 该方法用于策略图中提供了策略组的处理
     * @param runingDiagrams 多个可执行策略图
     * @param Arguments 启动参数
     */
    async groupProcess(runingDiagrams, Arguments) {
        const dispatcher = this.tools.getDispatchers();
        let i = 0, len = runingDiagrams.length;
        while (i < len) {
            try {
                // 只要挂载的值
                return await dispatcher.execute(runingDiagrams[i], Arguments, this.result);
            }
            catch (_a) {
                // node 10支持不获取参数
                // 执行直到获取到真正的结果
            }
            i++;
            if (i = len - 1) {
                return {};
            }
        }
    }
    // 说明递归调用或者并发调用可以用于备选组
    // 递归函数如果想让下一个策略函数进行递归执行,不应该再次调用递归钩子(他也不会起作用).
    // 递归调用返回的内容交由下一个策略函数后该函数自行调用递归钩子
    // 其次并发函数涉及到统一性问题上,例如我们有10个并发请求,但是10个请求中有可能出现一个错误的
    // 这个框架不可能保证所有的请求结果都完整无缺,所以并发函数要在内部保证自己的数据有效性
    // 其次返回值问题,并发函数不建议返回值最好返回undefined然后将结果挂载在result上,如果非返回不可
    // 外部的处理方式就是使用Object.assign()将所有的返回结果进行浅合并
    // 关于fail钩子
    // 对于递归函数来说他有两个停止的钩子一个是stopRecursion,另外一个就是fail
    // 区别在于调用stopRecursion后返回的内容依然还是获取的,依然会交由下一个策略函数.
    // 调用fail后将会抛出错误,如果没有使用策略图没有tryError就会报错.
    // 对于并发函数来说就有一个fail函数,简单讲如果有任何一个并发调用了这个钩子则所有的并发的函数都会失效.
    // 后续的操作也是判断是否使用了tryError然后进行处理.
    /**
     * 该方法专门用于处理要求递归的函数
     * @param stragegyFun 需要进行递归的策略函数
     * @param Arguments 参数对象
     */
    async recursiveProcess(stragegyFun, Arguments) {
        let returnArguments;
        // 提供停止钩子
        this.handle.stopRecursion = () => {
            this.flag.isRecursion = this.handle.stopRecursion = false;
        };
        this.handle.arguments = Arguments;
        while (this.flag.isRecursion) {
            returnArguments = await stragegyFun(this.handle, this.baseInf);
            // 调用fail 直接throw Error
            if (this.flag.isFail) {
                this.flag.isFail = true;
                throw new Error(`ERR_ASYNC_TYPE`);
            }
            this.handle.arguments = returnArguments;
        }
        return returnArguments;
    }
    /**
     * 当流程执行到错误的时候,例如策略函数调用了fail钩子,又例如策略函数抛出了一个错误,调用该方法来进行处理
     *
     * **注意**:调用该方法后禁止在外部使用trycatch
     *
     * @param diagram 策略图对象
     * @param Arguments 参数对象
     * @param error catch中提供的信息
     */
    async failProcess(diagram, Arguments, error) {
        this.flag.isFail = false;
        if (!diagram.tryError) {
            if (error) {
                throw error;
            }
            throw `ERR_ASYNC_TYPE ${error ? error : ''}`;
        }
        const defaultReturn = {};
        // 如果有备选可执行策略图就执行
        if (Array.isArray(diagram.runningDiagramGroup)) {
            try {
                return await this.groupProcess(diagram.runningDiagramGroup, Arguments);
            }
            catch (error) {
                if (!diagram.tryError) {
                    throw error;
                }
                return defaultReturn;
            }
        }
        else {
            return defaultReturn;
        }
    }
    async concurrentProcess(stragegyFun, Arguments) {
        // 先收回flag允许并发再次调用并发
        this.flag.isConcurrent = false;
        // 抹消递归钩子的功能
        const recursionBackup = this.handle.recursion;
        this.handle.recursion = () => false;
        let collection = [], resultCollection = [];
        for (const Argument of Arguments) {
            collection.push(stragegyFun(this.handle, this.baseInf));
        }
        for (const result of collection) {
            resultCollection.push(await result);
            if (this.flag.isFail) {
                throw new Error(`ERR_ASYNC_TYPE`);
            }
        }
        // 恢复递归钩子的功能
        this.handle.recursion = recursionBackup;
        return Object.assign({}, ...resultCollection);
    }
    /**
     * 该方法将策略函数执行,根据策略函数调用不同的钩子.
     * 执行不同的操作策略.
     *
     * @param diagram 策略图对象
     * @param Arguments 上一个策略图返回的参数对象
     */
    async Process(diagram, Arguments) {
        const stragegyFun = this.tools.getStragegy(this.runingDiagram.hostName, diagram.stragegyName);
        this.handle.arguments = Arguments;
        // 先判断是否为并发处理,之所以在这里判断是因为,并发是上一个策略函数交由本次执行的
        if (this.flag.isConcurrent) {
            if (Array.isArray(Arguments)) {
                try {
                    // 直接返回内容,首先并发后无法再次调用递归,所以直接返回内容
                    return await this.concurrentProcess(stragegyFun, Arguments);
                }
                catch (error) {
                    return await this.failProcess(diagram, Arguments, error);
                }
            }
            else {
                throw Error('unknow error');
            }
        }
        let returnArguments;
        try {
            /**
             * 普通返回Object或者undefined
             *
             * 递归或者并发返回undefined或者[...Arguments]
             */
            returnArguments = await stragegyFun(this.handle, this.baseInf);
        }
        catch (error) {
            returnArguments = await this.failProcess(diagram, Arguments, error);
        }
        // 要求本次进行递归处理
        if (this.flag.isRecursion) {
            try {
                returnArguments = await this.recursiveProcess(stragegyFun, returnArguments);
            }
            catch (error) {
                returnArguments = await this.failProcess(diagram, Arguments, error);
            }
            return returnArguments;
        }
        return returnArguments;
    }
    /**
     * 执行且获取可执行策略图最终的结果
     *
     * **注意**:resultOption是一个相当特殊的选项,如果传入一个对象则意味着开启了备选可执行模式
     * 将只结果挂载到传入的对象身上而不会返回结果,代替返回结果的是最后一个策略函数返回的参数,这个参数将传入后续的策略函数中
     *
     * @param Arguments 执行第一个策略函数的初始值
     * @param resultOption 使用该对象替换掉执行器中的结果对象.
     */
    async execute(runningDiagramName, Arguments = {}, resultOption) {
        this.result = resultOption ? resultOption : {};
        // 挂载可执行图,包含基本信息
        this.runingDiagram = this.tools.getRunningDiagram(runningDiagramName);
        // 挂载策略函数组
        this.diagrams = this.runingDiagram.diagrams;
        // 挂载基本信息
        this.baseInf = {
            baseUrl: this.runingDiagram.baseUrl,
            diagramName: this.runingDiagram.RunningDiagramName,
            hostName: this.runingDiagram.hostName
        };
        let i = 0, len = this.diagrams.length;
        while (i < len) {
            /**
             * 如果异步出错基本就是没有提供tryError,这里不会拦截
             *
             * 此外使用tryError后不会返回结果,即下一个策略函数就没有参数.
             * 如果使用了备选可执行任务图均失败且使用了tryError则也不会报错.
             */
            Arguments = await this.Process(this.diagrams[i], Arguments);
            i++;
        }
        // 返回最后一个策略函数的内容
        if (resultOption) {
            return Arguments;
        }
        // 返回执行结果且过滤掉函数
        return JSON.parse(JSON.stringify(this.result));
    }
}
exports.Dispatchers = Dispatchers;
