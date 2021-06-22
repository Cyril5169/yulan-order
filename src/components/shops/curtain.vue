<template>
  <el-card shadow="hover">
    <p style="color: red;margin:0;font-size:12px;">（带*号表示可选择帘头外包盒）</p>
    <div style="margin-top:10px;display:flex;line-height:40px;">
      <el-input clearable v-model.trim="searchKey" @clear="searchCurtain" @keyup.enter.native="searchCurtain"
        placeholder="输入商品型号查找商品" style="width:300px;">
        <el-button @click="searchCurtain" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
      <span v-if="newsData.length" style="margin-left:10px;flex:1;">
        <el-carousel height="40px" direction="vertical">
          <el-carousel-item v-for="(item,index) in newsData" :key="index">
            <a style="text-decoration:underline;font-size:13px;" :key="item.ID"
              @click="showDetailStopData(item,index)">{{ item.TITLE }}</a>
          </el-carousel-item>
        </el-carousel>
      </span>
    </div>
    <el-table :data="curtainMsg" style="min-width: 750px; margin: 5px auto;">
      <el-table-column label="型号" width="100" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.wbhFlag == '1'">
            {{ scope.row.itemNo }}
            <span style="color: red;">*</span>
          </div>
          <div v-else>
            {{ scope.row.itemNo }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="宽度(m)" width="80" align="center">
        <template slot-scope="scope">
          <currency-input :customStyle="'width: 60px;'" placeholder="0.00" v-model="scope.row.width">
          </currency-input>
        </template>
      </el-table-column>
      <el-table-column label="高度(m)" width="80" align="center">
        <template slot-scope="scope">
          <currency-input :customStyle="'width: 60px;'" placeholder="0.00" v-model="scope.row.height">
          </currency-input>
        </template>
      </el-table-column>
      <el-table-column label="帘外包宽度(m)" prop="fixGrade" width="120" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.wbhFlag == '1'">
            <el-checkbox v-model="scope.row.isWBH">
              <currency-input :customStyle="'width: 60px;'" placeholder="0.00" v-model="scope.row.WBH">
              </currency-input>
            </el-checkbox>
          </div>
          <div v-else>
            <el-checkbox v-model="scope.row.isWBH" disabled>
              <el-input style="width:60px;" size="mini" placeholder="无" v-model="scope.row.WBH" disabled>
              </el-input>
            </el-checkbox>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="褶皱倍数" width="100" align="center">
        <template slot-scope="scope">
          <el-select size="mini" v-model="scope.row.multiple" style="width:70px;">
            <el-option v-for="item in options" :key="item.value" :label="item.value" :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="位置" width="140" align="center">
        <template slot-scope="scope">
          <el-input style="width:120px;" size="mini" ref="location" placeholder="选填(20字符内)" v-model="scope.row.location"
            @input="oninput($event,scope.$index)">
          </el-input>
        </template>
      </el-table-column>
      <el-table-column label="活动" width="280" align="center">
        <template slot-scope="scope">
          <el-select style="width:250px" size="mini" :disabled="isActivity[scope.$index]" v-model="scope.row.activityId"
            :placeholder="
                  isActivity[scope.$index] == true
                    ? '无可选活动'
                    : '请选择活动'
                ">
            <el-option v-for="item in activityOptions[scope.$index]" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <a @click="chooseItem(scope.row, scope.$index)" style="color:red;">选择此款</a>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin:0 20%;" @current-change="searchCurtain" :current-page.sync="currentPage" :page-size="limit"
      layout="total, prev, pager, next, jumper" :total="totalNumber">
    </el-pagination>

    <!-- 停产通知 -->
    <el-dialog :visible.sync="newsDetailShow" width="350px" :title="stopDetailTitle">
      <el-table :data="stopDetailList">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="型号" prop="ITEM_NO" align="center"></el-table-column>
        <el-table-column label="更改时间" prop="STOP_DATE" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.STOP_DATE | dateFilter }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapMutations } from "vuex";
import Cookies from "js-cookie";
import { GetCurtainByCondition } from "@/api/itemInfoASP";
import { GetPromotionByItem } from "@/api/orderListASP";
import { GetStopProductionData } from "@/api/newCurtainASP";

export default {
  name: "Curtain",
  data() {
    return {
      cid: Cookies.get("cid"), //假定的用户ID
      customerType: Cookies.get("customerType"), //客户类型
      searchKey: "", //搜索的关键词
      //窗帘数据
      curtainData: [],
      //产品对应的数据：宽、高、假帘高、褶皱倍数、位置、活动
      curtainMsg: [],
      //褶皱倍数选项
      options: [
        { value: "1.8" },
        { value: "1.9" },
        { value: "2.0" },
        { value: "2.1" },
        { value: "2.2" },
        { value: "2.3" },
        { value: "2.4" },
        { value: "2.5" },
        { value: "2.6" },
        { value: "2.7" },
        { value: "2.8" },
        { value: "2.9" },
        { value: "3.0" },
      ],
      activityOptions: [], //活动的数组
      isActivity: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ], //是否有活动
      activityGroup: [], //活动ID对应的groupType
      currentPage: 1, //当前的页数
      limit: 10, //每页的个数
      totalNumber: 0, //总条数
      newsData: [],
      newsDetailShow: false,
      stopDetailList: [],
      stopDetailTitle: ''
    };
  },
  methods: {
    ...mapMutations("navTabs", ["addTab"]),
    //限制输入长度
    oninput(e, index) {
      e = this.splitStr(e, 20);
      this.curtainMsg[index].location = e;
    },
    splitStr(str, length) {
      var len = 0;
      var returnStr = "";
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
          len++;
        } else {
          len += 2;
        }
        if (len <= length) returnStr += String.fromCharCode(c);
      }
      return returnStr;
    },
    //进入窗帘详情
    chooseItem(data, index) {
      let arr = [];
      let str = "";
      if (data.width == "") {
        arr.push("宽度");
      }
      if (data.height == "") {
        arr.push("高度");
      }
      if (data.multiple == "") {
        arr.push("褶皱倍数");
      }
      if (arr.length !== 0) {
        str = arr.join("、");
        this.$alert(`请确保产品${data.itemNo}的${str}已经输入!!`, "提示", {
          confirmButtonText: "好的",
        });
        return;
      }
      if (data.activityId == "") {
        if (this.isActivity[index] == false) {
          this.$alert("请选择活动!!", "提示", {
            confirmButtonText: "好的",
          });
          return;
        } else data.activityId = null;
      }
      if (data.wbhFlag == "1" && data.isWBH == false && data.WBH !== "") {
        this.$alert("在填写了帘外包宽度的情况下，请勾选前面的按钮!!", "提示", {
          confirmButtonText: "好的",
        });
        return;
      }
      if (data.wbhFlag == "1" && data.isWBH == true && data.WBH == "") {
        this.$alert("在勾选了帘外包的情况下，帘外包宽度不能为空!!", "提示", {
          confirmButtonText: "好的",
        });
        return;
      }
      let _groupType;
      this.activityGroup.forEach((item) => {
        if (item.pId == data.activityId) {
          _groupType = item.groupType;
        }
      });
      this.curtainMsg[index].groupType = _groupType;
      let activeName = "";
      this.activityOptions[index].forEach((item) => {
        if (item.value == data.activityId) {
          activeName = item.label;
        }
      });
      this.curtainMsg[index].activeName = activeName;
      Cookies.set("curtainMsg", data);
      this.addTab("shops/shoppingCurtainDetail");
      this.$router.push({
        name: `shoppingCurtainDetail`,
      });
    },
    //获取窗帘数据
    searchCurtain(status) {
      this.curtainData = [];
      GetCurtainByCondition({
        keywords: this.searchKey,
        limit: this.limit,
        page: this.currentPage,
      }).then((res) => {
        this.curtainData = res.data;
        this.totalNumber = res.count;
        this.createCurtainMsg();
      }).catch((err) => { });
    },
    //渲染到表格的数
    async createCurtainMsg() {
      this.curtainMsg = [];
      this.activityOptions = [];
      this.isActivity = [];
      for (var i = 0; i < this.curtainData.length; i++) {
        var data = this.curtainData[i];
        this.curtainMsg.push({
          itemNo: data.ITEM_NO, //型号
          width: "", //宽
          height: "", //高
          WBH: "", //假帘高
          isWBH: false, //false:不选假帘高，true：选择假帘高
          wbhFlag: data.WBH_FLAG, //1：需要假帘高，0：不需要假帘高
          multiple: "2.2", //褶皱倍数
          location: "", //位置
          activityId: "", //活动
          groupType: "", //groupType
          activeName: "",
        });
        let res = await GetPromotionByItem(
          {
            cid: this.cid,
            customerType: this.customerType,
            itemNo: data.ITEM_NO,
            itemVersion: data.ITEM_VERSION,
            productType: data.PRODUCT_TYPE,
            productBrand: data.PRODUCT_BRAND,
          },
          { loading: false }
        );
        //没有活动下拉框disable
        if (res.data.length == 0) this.isActivity.push(true);
        else this.isActivity.push(false);
        let _obj = [];

        var defaultSel = {
          pri: 0,
          id: 0,
        };
        //查找默认活动
        for (var j = 0; j < res.data.length; j++) {
          var obj = {
            label: res.data[j].ORDER_TYPE + " -- " + res.data[j].ORDER_NAME,
            value: res.data[j].P_ID,
          };
          var obj1 = {
            pId: res.data[j].P_ID,
            groupType: res.data[j].GROUP_TYPE,
          };
          if (res.data[j].PRIORITY != 0 && defaultSel.pri == 0) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          } else if (
            res.data[j].PRIORITY != 0 &&
            defaultSel.pri > res.data[j].PRIORITY
          ) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          }
          let re = this.activityGroup.some((i) => i.pId == obj1.pId);
          if (re == false) this.activityGroup.push(obj1);
          _obj.push(obj);
        }
        _obj.push({
          label: "不参与活动",
          value: null,
        });
        this.activityOptions.push(_obj);

        if (defaultSel.pri != 0) {
          this.curtainMsg[i].activityId = defaultSel.id;
        }
      }
    },
    //初始化
    init() {
      this.currentPage = 1;
      this.searchCurtain();
    },
    //停产新闻
    getStopProductionNews() {
      GetStopProductionData({ proType: 'curtain' }).then(res => {
        //分成两块，待淘汰和停产
        if (res.data.length) {
          var statusList = [
            {
              value: 'stay',
              label: '待淘汰'
            },
            {
              value: 'stop',
              label: '已淘汰'
            }
          ]
          for (var s = 0; s < statusList.length; s++) {
            var status = statusList[s];
            var filterData = res.data.filter(item => item.STOP_TYPE == status.value);
            if (filterData.length) {
              //按年月分组
              var groupData = this.groupBy(filterData, "STOP_DATE", this.datatrans);
              for (var g = 0; g < groupData.length; g++) {
                var itemTxt = '';
                for (var i = 0; i < groupData[g].value.length; i++) {
                  itemTxt += groupData[g].value[i].ITEM_NO + '，';
                  if (i >= 3) break;
                }
                itemTxt = status.label + '产品：' + groupData[g].group + '，型号：' + itemTxt;
                if (groupData[g].value.length > 3) {
                  itemTxt += '...';
                } else {
                  itemTxt = itemTxt.substring(0, itemTxt.length - 1)
                }
                //拼接
                this.newsData.push({
                  ID: status.value + groupData[g].group,
                  TITLE: itemTxt,
                  DATA: filterData
                })
              }
            }
          }
        }
      })
    },
    datatrans(value) {
      //时间戳转化大法
      if (value == null || value == "") {
        return "";
      }
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      return y + "-" + MM
    },
    showDetailStopData(item, index) {
      this.stopDetailList = JSON.parse(JSON.stringify(item.DATA));
      if (item.TITLE.indexOf('待淘汰') > -1) this.stopDetailTitle = "待淘汰产品列表";
      else this.stopDetailTitle = "已淘汰产品列表";
      this.newsDetailShow = true;
    },
    //单列的groupby
    groupBy(array, name, filterMethod = function (a) { return a }) {
      let groups = [];
      array.forEach((item) => {
        let groupName = filterMethod(item[name]);
        var hasgroup = groups.filter((item) => item.group == groupName);
        if (hasgroup.length) {
          hasgroup[0].value.push(item);
        } else {
          groups.push({
            group: groupName,
            value: [item],
          });
        }
      });
      return groups;
    },
  },
  created() {
    this.init();
    this.getStopProductionNews();
  },
  activated() {
    var selectNo = this.$route.params.selectNo;
    if (selectNo) {
      this.searchKey = selectNo;
      this.init();
    }
    this.getStopProductionNews();
  },
};
</script>
