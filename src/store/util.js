//根据传入的index对应修改其标签页名字
export function tabsName(index) {
  switch (index) {
    case 'main':
      return '主页';
    case "shops/shoppingCurtainDetail":
      return "商品详情";
    case "detail/detailRefund":
      return "赔偿确认书详情";
    case "order/orderDetail":
      return "订单详情";
    case "order/checkOrder":
      return "订单结算";
    case "order/shipment":
      return "出货详情";
    case "detail/detailWallPaper":
      return "墙纸详情";
    case "detail/detailCurtain":
      return "窗帘详情";
    case "detail/detailSoftSuit":
      return "软装详情";
    case "order/examineDetailNew":
      return "审核详情";
    case "order/checkExamine":
      return "订单详情";
    case "myZone/myCoupon":
      return "我的优惠券";
    case "notification/notificationMain":
      return "公告";
    default:
      return "xxx";
  }
}