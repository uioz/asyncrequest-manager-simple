"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dispatchers_1 = require("./Dispatchers");
/**
 * 针对AsyncRequestManagerSimple制作的工具类
 */
class Tool {
    constructor(tasks, stragegyTree) {
        this.runningDiagramTree = tasks;
        this.stragegyTree = stragegyTree;
        this.requestManager = this.requestManager;
    }
    getObj() {
        return {};
    }
    getInitActionTree() {
        return this.getObj();
    }
    getInitTasks() {
        return this.getObj();
    }
    hasParam(obj, name) {
        return !!obj[name];
    }
    /**
     * 获取可执行策略图
     * @param runningDiagramName 可执行策略图的名称
     */
    getRunningDiagram(runningDiagramName) {
        try {
            return this.runningDiagramTree[runningDiagramName];
        }
        catch (error) {
            throw new Error(`cannot found ${runningDiagramName} of runningDiagram in AsyncRequestManagerSimple!`);
        }
    }
    /**
     * 获取指定信息的策略函数
     * @param hostName 域名名词
     * @param stragegyName 策略名称
     */
    getStragegy(hostName, stragegyName) {
        return this.stragegyTree[hostName][stragegyName];
    }
    /**
     * 以工厂模式返回一个可执行策略图运行器
     */
    getDispatchers() {
        return new Dispatchers_1.Dispatchers(this);
    }
    /**
     * 可执行策略图内容补全,调用该方法会进行递归查找需要的属性.
     *
     * 然后返回校验完成的可执行策略图
     */
    diagramComplete(diagram) {
        const result = {
            hostName: diagram.hostName,
            RunningDiagramName: diagram.RunningDiagramName,
            baseUrl: diagram.baseUrl,
            diagrams: diagram.diagrams
        };
        const diagrams = result.diagrams;
        for (const diagram of diagrams) {
            if (!diagram.runningDiagramGroup) {
                diagram.runningDiagramGroup = false;
            }
            diagram.tryError = !!diagram.tryError;
        }
        return result;
    }
    /**
     * 策略图内容补全,调用该方法会进行递归查找需要的属性.
     *
     * 并且给属性设置默认值.
     */
    requestTaskComplete(requestTask) {
    }
}
exports.Tool = Tool;
