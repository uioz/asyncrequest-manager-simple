import { StragegyTree,Tasks,keyType,RunningDiagram,RequestTask } from "./types";

/**
 * 针对AsyncRequestManagerSimple制作的工具类,主要负责数据初始化
 */
export class Tool {

    private runningDiagramTree:Tasks;

    constructor(tasks:Tasks){
        this.runningDiagramTree = tasks;
    }

    public getObj():object{
        return {};
    }

    public getInitActionTree(){
        return this.getObj() as StragegyTree;
    }

    public getInitTasks(){
        return this.getObj() as Tasks;
    }

    public hasParam<T extends object>(obj:T,name:keyType):boolean{
        return !!obj[name];
    }

    /**
     * 获取可执行策略图
     * @param runningDiagramName 可执行策略图的名称
     */
    public getRunningDiagram(runningDiagramName:keyType):RunningDiagram{
        return this.runningDiagramTree[runningDiagramName];
    }

    /**
     * 策略图内容补全,调用该方法会进行递归查找需要的属性.
     * 
     * 并且给属性设置默认值.
     */
    public diagramComplete(diagram:RunningDiagram){

        const diagrams = diagram.diagrams;

        for (const diagram of diagrams) {

            if(!diagram.stragegyGroup){
                diagram.stragegyGroup = false;
            }

            diagram.tryError = !!diagram.tryError;

        }
        
    }

    /**
     * 策略图内容补全,调用该方法会进行递归查找需要的属性.
     * 
     * 并且给属性设置默认值.
     */
    public requestTaskComplete(requestTask:RequestTask){

    }
}
