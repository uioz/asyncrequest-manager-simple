import { RunningDiagram,RequestManger,keyType,Stragegy } from "./types";

export class Dispatchers{

    private requestManger:RequestManger;

    constructor(requestModule:RequestManger){
        this.requestManger = requestModule;
    }

    /**
     * 异步执行器
     */
    public async execute(stragegyMap:{[stragegyName:string]:Stragegy},diagram:RunningDiagram){

        const stragegies = diagram.diagrams;

        let result = {},
            lastArguments = {},
            returnArguments = {},
            nowStragegy = stragegies[0];
        
        
        

        
    }
}

// TODO 要不给Diagram 添加递归和并发属性
// 递归模式下原来的handle返回的内容继续传递
// 关键是不用第一次进入了

// TODO 或者改写handle为由上一个策略触发让下一个策略进行递归或者并发.(这个好一些)