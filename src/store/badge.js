const state = {
    painting: 0,        //委托喷绘角标
    refund: 0,           //退货赔偿角标
    orderDeal: 0,//待处理订单
    statement: 0,//对账单
    payDelegation1: 0,//付款委托书中待客户确定的及退回的单据个数（客户可处理）
    payDelegation2: 0,//付款委托书中客户确定的单据个数（可审核）
    lanju1: 0,//兰居设计中客户被退回的单据个数（客户可重新编辑提交）
    lanju2: 0,//兰居设计中市场部可审核的单据个数（单据状态为未审核）
    lanju3: 0,//兰居设计中广美设计可审核的单据个数（单据状态为广美财务审核通过）
    lanju4: 0,//兰居设计中广美财务可审核的单据个数（单据状态为市场部审核通过）
    complaint1: 0,//物流投诉中可进行评价的单据个数（客户评价）
    complaint2: 0,//物流投诉中未处理的单据个数（公司处理）
    imageShop1: 0,//形象店设计中可编辑的单据个数（客户）
    imageShop2: 0,//形象店设计中可编辑的单据个数（兰居）
    imageShop3: 0,//形象店设计中可编辑的单据个数（广美）
    wallCount: 0,//墙纸购物车
    curtainCount: 0,//窗帘购物车
    newCurtainCount: 0, //新窗帘
    softCount: 0,//软装购物车
    newRefund1: 0,//新退款投诉中用户可确认的单据
    newRefund2: 0,//新退款投诉中兰居可审核编辑的单据
    wangqian: 0,//网签系统待处理数量
    ljaftersale: 0,
    ljaftersaleexamine: 0,
}

const mutations = {
    /**
     * 传入一个含名字和数字对象
     * 修改对应名字角标的值
     */
    changeBadge(state, obj) {
        state[obj.name] = obj.index
    },
    /**
     * 传入一个名字
     * 其值+1
     */
    addBadge(state, name) {
        state[name]++
    },
    /**
     * 传入一个名字
     * 其值-1
     */
    releaseBadge(state, name) {
        state[name]--
    }
}

const getters = {
    getRefund: state => {
        return state.refund
    },
    getPainting: state => {
        return state.painting
    }
}
export default {
    namespaced: true,
    state,
    mutations,
    getters
}