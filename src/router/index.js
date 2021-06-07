import Vue from 'vue'
import store from '../store/index';
import Router from 'vue-router'
import Login from '@/components/login'
import Main from '@/components/main'
import WallPaper from '@/components/shops/wallPaper'
import Curtain from '@/components/shops/curtain'
import SoftSuit from '@/components/shops/softSuit'
import fixPriceShops from '@/components/shops/fixPriceShops'
import newCurtainShops from '@/components/shops/newCurtainShops'
import BankProof from '@/components/bankProof'
import painting from '@/components/painting'
import yulanPainting from '@/components/yulanPainting'
import DeputeBrush from '@/components/deputeBrush'
import DownloadSpace from '@/components/downloadSpace'
import MarketInfo from '@/components/marketInfo'
import RefundCompensation from '@/components/refundCompensation'
import Statement from '@/components/statement'
import Shopping from '@/components/shoppingCar/shopping'
import MyOrder from '@/components/order/myOrder'
import ImageShop from '@/components/design/imageShop'
import LanJu from '@/components/design/lanJu'
import DetailWallPaper from '@/components/detail/detailWallPaper'
import DetailCurtain from '@/components/detail/detailCurtain'
import shoppingNewCurtainEdit from '@/components/shoppingCar/shoppingNewCurtainEdit'
import DetailSoftSuit from '@/components/detail/detailSoftSuit'
import ShoppingCurtainDetail from '@/components/shops/shoppingCurtainDetail'
import checkOrder from '@/components/order/checkOrder'
import shipment from '@/components/order/shipment'
import examine from '@/components/order/examine'
import newCurtainExamine from '@/components/order/newCurtainExamine'
import examineDetailNew from '@/components/order/examineDetailNew'
import newCurtainExamineDetail from '@/components/order/newCurtainExamineDetail'
import checkExamine from '@/components/order/checkExamine'
import myCoupon from '@/components/center/myCoupon'
import DetailRefund from '@/components/detail/detailRefund'
import notificationMain from '@/components/notification/notificationMain'
import Complaint from '@/components/complaint'
import ComplaintReply from '@/components/complaintReply'
import StockQuery from '@/components/query/stockQuery'
import AreaQuery from '@/components/query/areaQuery'
import SalesQuery from '@/components/query/salesQuery'
import OrderQuery from '@/components/query/orderQuery'
import productQuery from '@/components/query/productQuery'
import limitPriceQuery from '@/components/query/limitPriceQuery'
import SupplyPort from '@/components/supplierModule/supplyPort'
import Trans from '@/components/supplierModule/trans'
import LanJuPort from '@/components/supplierModule/lanJuPort'
import DeliveryList from '@/components/supplierModule/deliveryList'
import ISExamineMarket from '@/components/design/ISExamineMarket'
import ISExamineGM from '@/components/design/ISExamineGM'
import lanJuGMExamine from '@/components/design/lanJuGMExamine'
import lanJuMarketExamine from '@/components/design/lanJuMarketExamine'
import payDelegation from '@/components/supplierModule/payDelegation'
import payDelegationExamine from '@/components/supplierModule/payDelegationExamine'
import DeliveryList_lanju from '@/components/supplierModule/deliveryList_lanju'
import refund from '@/components/newRefund'    
import refundExamine from '@/components/newRefundExamine'   
import lanJuFinanceExamine from '@/components/design/lanJuFinanceExamine'
import expressSearch from '@/components/order/expressSearch' 
import ljAfterSale from '@/components/aftersale/ljAfterSale'
import ljAfterSaleExamine from '@/components/aftersale/ljAfterSaleExamine'
import safeStock from '@/components/purplan/safeStock'
import basePlan from '@/components/purplan/basePlan'
import purPlan from '@/components/purplan/purPlan'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      component: Login,
      name: 'login'
    },
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/main',
      name: 'main',
      component: Main,
      //redirect: '/shops/wallPaper',
      children: [
        {
          path: '/shops/curtain',
          name: 'curtain',
          component: Curtain,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/shops/wallPaper',
          name: 'wallPaper',
          component: WallPaper,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/shops/softSuit',
          name: 'softSuit',
          component: SoftSuit,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/shops/fixPriceShops',
          name: 'fixPriceShops',
          component: fixPriceShops
        },
        {
          path: '/shops/newCurtainShops',
          name: 'newCurtainShops',
          component: newCurtainShops
        },
        {
          path: '/shops/shoppingCurtainDetail',
          name: 'shoppingCurtainDetail',
          component: ShoppingCurtainDetail,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/bankProof',
          name: 'bankProof',
          component: BankProof
        },
        {
          path: '/painting',
          name: 'painting',
          component: painting
        },
        {
          path: '/yulanPainting',
          name: 'yulanPainting',
          component: yulanPainting
        },
        {
          path: '/deputeBrush',
          name: 'deputeBrush',
          component: DeputeBrush
        },
        {
          path: '/downloadSpace',
          name: 'downloadSpace',
          component: DownloadSpace
        },
        {
          path: '/marketInfo',
          name: 'marketInfo',
          component: MarketInfo
        },
        {
          path: '/refundCompensation',
          name: 'refundCompensation',
          component: RefundCompensation,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/detail/detailRefund',
          name: 'detailRefund',
          component: DetailRefund,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/statement',
          name: 'statement',
          component: Statement,
        },
        {
          path: '/shoppingCar/shopping',
          name: 'shopping',
          component: Shopping,
        },
        {
          path: '/detail/detailCurtain',
          name: 'detailCurtain',
          component: DetailCurtain,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/shoppingCar/shoppingNewCurtainEdit',
          name: 'shoppingNewCurtainEdit',
          component: shoppingNewCurtainEdit,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/detail/detailSoftSuit',
          name: 'detailSoftSuit',
          component: DetailSoftSuit,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/detail/detailWallPaper',
          name: 'detailWallPaper',
          component: DetailWallPaper,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/order/myOrder',
          name: 'myOrder',
          component: MyOrder,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/design/imageShop',
          name: 'imageShop',
          component: ImageShop
        },
        {
          path: '/design/lanJu',
          name: 'lanJu',
          component: LanJu
        },
        {
          path: '/order/examine',
          name: 'examine',
          component: examine,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/order/newCurtainExamine',
          name: 'newCurtainExamine',
          component: newCurtainExamine,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/order/checkExamine',
          name: 'checkExamine',
          component: checkExamine,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/order/checkOrder',
          name: 'checkOrder',
          component: checkOrder,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/order/shipment',
          name: 'shipment',
          component: shipment,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/myZone/myCoupon',
          name: 'MyCoupon',
          component: myCoupon
        },
        {
          path: '/notification/notificationMain',
          name: 'notificationMain',
          component: notificationMain
        },
        {
          path: '/complaint',
          name: 'complaint',
          component: Complaint,
        },
        {
          path: '/complaintReply',
          name: 'complaintReply',
          component: ComplaintReply,
        },
        // 查询
        {
          path: '/query/stockQuery',
          name: 'stockQuery',
          component: StockQuery,
          
        },
        {
          path: '/query/areaQuery',
          name: 'areaQuery',
          component: AreaQuery,
          
        },
        {
          path: '/query/salesQuery',
          name: 'salesQuery',
          component: SalesQuery,
          
        },
        {
          path: '/query/orderQuery',
          name: 'orderQuery',
          component: OrderQuery,
          
        },
        {
          path: '/query/productQuery',
          name: 'productQuery',
          component: productQuery,
          
        },
        {
          path: '/query/limitPriceQuery',
          name: 'limitPriceQuery',
          component: limitPriceQuery,
          
        },
        {
          path: '/supplierModule/trans',
          name: 'trans',
          component: Trans
        },
        {
          path: '/supplierModule/supplyPort',
          name: 'supplyPort',
          component: SupplyPort
        },
        {
          path: '/supplierModule/lanJuPort',
          name: 'lanJuPort',
          component: LanJuPort
        },
        {
          path: '/supplierModule/deliveryList',
          name: 'DeliveryList',
          component: DeliveryList
        },
        {
          path: '/design/ISExamineMarket',
          name: 'ISExamineMarket',
          component: ISExamineMarket
        },
        {
          path: '/design/ISExamineGM',
          name: 'ISExamineGM',
          component: ISExamineGM
        },
        {
          path: '/design/lanJuGMExamine',
          name: 'lanJuGMExamine',
          component: lanJuGMExamine
        },
        {
          path: '/design/lanJuMarketExamine',
          name: 'lanJuMarketExamine',
          component: lanJuMarketExamine
        },
        {
          path: '/supplierModule/payDelegation',
          name: 'payDelegation',
          component: payDelegation
        },
        {
          path: '/supplierModule/payDelegationExamine',
          name: 'payDelegationExamine',
          component: payDelegationExamine
        },
        {
          path: '/order/examineDetailNew',
          name: 'examineDetailNew',
          component: examineDetailNew,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/order/newCurtainExamineDetail',
          name: 'newCurtainExamineDetail',
          component: newCurtainExamineDetail,
          meta: {
            returnMain: true//该页面刷新回到主界面
          }
        },
        {
          path: '/supplierModule/deliveryList_lanju',
          name: 'DeliveryList_lanju',
          component: DeliveryList_lanju
        },
        {
          path: '/newRefund',
          name: 'refund',
          component: refund
        },
        {
          path: '/newRefundExamine',
          name: 'refundExamine',
          component: refundExamine
        },
        {
          path: '/design/lanJuFinanceExamine',
          name: 'lanJuFinanceExamine',
          component: lanJuFinanceExamine
        },
        {
          path: '/order/expressSearch',
          name: 'expressSearch',
          component: expressSearch
        },
        {
          path: '/aftersale/ljAfterSale',
          name: 'ljAfterSale',
          component: ljAfterSale
        },
        {
          path: '/aftersale/ljAfterSaleExamine',
          name: 'ljAfterSaleExamine',
          component: ljAfterSaleExamine
        },
        {
          path: '/purplan/safeStock',
          name: 'safeStock',
          component: safeStock
        },
        {
          path: '/purplan/basePlan',
          name: 'basePlan',
          component: basePlan
        },
        {
          path: '/purplan/purPlan',
          name: 'purPlan',
          component: purPlan
        },
      ]
    }
  ]
})
//解决刷新后点击tab报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

import Cookies from 'js-cookie'
//路由守卫
router.beforeEach((to, from, next) => {
  if (!Cookies.get('cid') && !Cookies.get('customerType') && to.name != 'login') {//判断用户信息，不合法返回登陆界面
    next('/login')
  } else {
    if (from.path == '/' && to.meta.returnMain) {//如果是刷新判断是否需要回到主界面
      if (to.name == 'login' || to.name == 'main' || to.name == 'wallPaper') {
        next()
      }
      else {
        next('/main');
      }
    }
    else {//不是刷新
      next();
      history.pushState(null, null, location.href);//禁止后退，搭配APP.VUE里面的mounted
    }
  }

})

export default router;
