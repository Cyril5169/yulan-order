<template>
  <el-card shadow="never">
    <div class="curtainTable">
      <div style="margin-bottom:10px;">活动：<el-select v-if="tableStatus === 0" size="small" style="width:250px"
          v-model="headerData.activityId" :placeholder="activityOptions.length == 1? '无可选活动': '请选择活动'">
          <el-option v-for="item in activityOptions" :key="item.P_ID"
            :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
          </el-option>
        </el-select>
        <span v-else>{{headerData.activityName}}</span>
        <span style="color:red;font-size:14px;" v-if="
                  headerData.activityId === headerData.activityName &&
                    headerData.activityEffective != null &&
                    !headerData.activityEffective
                ">此活动已经过期，请重新选择</span>
      </div>
      <el-table style="width:100%;" border :data="data" :span-method="cellMerge">
        <el-table-column width="170" header-align="center" label="商品信息">
          <template>
            <div class="messageBox">
              <div>
                <label>款号:</label>
                <div class="messageInput">{{ headerData.modelNumber }}</div>
              </div>
              <div>
                <label>成品宽:</label>
                <div class="messageInput">{{ headerData.width }}</div>
                m
              </div>
              <div>
                <label>成品高:</label>
                <div class="messageInput">{{ headerData.height }}</div>
                m
              </div>
              <div>
                <label>假帘高:</label>
                <div class="messageInput">{{ headerData.highJia }}</div>
                m
              </div>
              <div>
                <label>褶皱倍数:</label>
                <div class="messageInput">{{ headerData.drape }}</div>
              </div>
              <div>
                <label>帘头外包盒单边宽度:</label>
                <div v-if="
                    headerData.outsourcingBoxExist === 1 &&
                      headerData.outsourcingBoxWidth != 0
                  " class="messageInput">
                  {{ headerData.outsourcingBoxWidth }}
                </div>
                <div v-else class="messageInput">无</div>
                m
              </div>
              <div>
                <label>位置:</label>
                <div class="messageInput" style="width: 100px;">
                  {{
                    headerData.location === null || headerData.location === ""
                      ? "无"
                      : headerData.location
                  }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="名称" header-align="center" width="85">
          <template slot-scope="scope">
            {{ getTypeName(scope.row.curtainPartName) }}
            <!-- <br> -->
            <span v-if="tableStatus !== 3">
              <el-checkbox @change="changeLink('ls', 1)" v-if="scope.row.itemType === 'ls'" v-model="chooseBig[1]">
                <span v-if="chooseBig[1] == false" style="color: red;">×</span>
              </el-checkbox>
              <el-checkbox @change="changeLink('lspb', 2)" v-if="scope.row.itemType === 'lspb'" v-model="chooseBig[2]">
                <span v-if="chooseBig[2] == false" style="color: red;">×</span>
              </el-checkbox>
              <el-checkbox @change="changeLink('sha', 3)" v-if="scope.row.itemType === 'sha'" v-model="chooseBig[3]">
                <span v-if="chooseBig[3] == false" style="color: red;">×</span>
              </el-checkbox>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="编码" header-align="center" width="125">
          <template slot-scope="scope">
            <div>
              <span v-if="tableStatus === 3">
                {{ scope.row.item.itemNo }}
              </span>
              <!-- 配件包 -->
              <span v-else-if="
                  scope.row.itemType === 'pjb' && scope.row.changeFlag === 'Y'
                ">
                <el-select size="mini" v-model="scope.row.item.itemNo" placeholder="请选择" @change="changePJBUnit(scope.$index)">
                  <el-option v-for="item in part2" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </span>
              <!-- 非配件包 -->
              <span v-else>
                <!-- 可替换 -->
                <a v-if="scope.row.changeFlag === 'Y'" class="uline"
                  @click="getNewItemNo(scope.row, scope.$index)">{{ scope.row.item.itemNo }}</a>
                <!-- 不可替换 -->
                <span v-else>{{ scope.row.item.itemNo }}</span>
                <!-- 是否可删 -->
                <el-checkbox class="ml5" v-if="scope.row.deleteFlag === 'Y'" v-model="scope.row.choose"
                  @change="changeLinkReverse(scope.row)">
                </el-checkbox>
              </span>
              <span v-if="bigToSmall(scope.row) == true && tableStatus !== 3" style="color: red;">
                ×
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="名称" header-align="center" width="110">
          <template slot-scope="scope">
            <div v-if="scope.row.curtainItemName !== null && scope.row.curtainItemName !== ''">
              {{ scope.row.curtainItemName }}
            </div>
            <div v-else>{{ getTypeName(scope.row.itemType) }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="isManager != '0' ||  (isManager == '0' && check_CURTAIN_STATUS_ID == -1)" label="单价" align="center"
          width="50">
          <template slot-scope="scope">
            <span>
              {{ scope.row.price }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="(isManager != '0' ||  (isManager == '0' && check_CURTAIN_STATUS_ID == -1)) && salPromotion.P_ID"
          label="折后" align="center" width="55">
          <template slot-scope="scope">
            <span>
              {{ calculatePromotionPrice(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="规格:米/对" header-align="center" align="center" width="60">
          <template slot-scope="scope">
            {{
              scope.row.specification === 0 || scope.row.specification === null
                ? "--"
                : scope.row.specification
            }}
          </template>
        </el-table-column>
        <el-table-column label="面料属性" width="100" header-align="center" align="center">
          <template slot-scope="scope">
            <div v-if="
                scope.row.certainHeightWidth !== null &&
                  scope.row.productType === 'ML'
              ">
              <el-select :disabled="tableStatus === 3" size="mini" v-model="scope.row.certainHeightWidth" placeholder="请选择"
                @change="changeDosageByFixtype(scope.$index)">
                <el-option v-for="item in fixType" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else></div>
          </template>
        </el-table-column>
        <el-table-column label="用量" width="90" header-align="center" align="center">
          <template slot-scope="scope">
            <span v-if="tableStatus === 3">
              {{ scope.row.dosage | dosageFilter }}
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
            <span v-else-if="customerType === '110'">
              <el-input style="width: 75%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                v-model="scope.row.dosage">
              </el-input>
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
            <span v-else-if="scope.row.itemType === 'lspb'">--</span>
            <span v-else-if="scope.row.modifyFlag === 'Y'">
              <el-input style="width: 75%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 2)"
                v-model="scope.row.dosage">
              </el-input>
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
            <span v-else>
              {{ scope.row.dosage | dosageFilter }}
              {{ scope.row.dosage === "" ? "" : scope.row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
        <el-table-column v-if="isManager != '0' ||  (isManager == '0' && check_CURTAIN_STATUS_ID == -1)" label="总价" align="center"
          width="60">
          <template slot-scope="scope">
            <span>
              {{ oneTotal(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="制造说明" width="110" header-align="center" align="center">
          <template slot-scope="scope">
            <div v-if="tableStatus === 3">
              {{ scope.row.manufacturingInstructions }}
            </div>
            <div v-else-if="scope.row.productType === 'XHB'"></div>
            <div v-else-if="scope.row.itemType === 'lt'">
              <el-select size="mini" v-model="scope.row.manufacturingInstructions" placeholder="--未选--">
                <el-option v-for="item in part0" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else-if="scope.row.itemType === 'lspb'">
              <el-select size="mini" v-model="scope.row.manufacturingInstructions" placeholder="--未选--">
                <el-option v-for="item in part3" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div v-else-if="scope.row.productType === 'ML'">
              <el-select size="mini" v-model="scope.row.manufacturingInstructions" placeholder="--未选--">
                <el-option v-for="item in part1" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="说明" header-align="center" width="80">
          <template slot-scope="scope">
            <span style="color:red;">
              {{ scope.row.illustrate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" header-align="center">
          <template slot-scope="scope">
            <el-input :autosize="{ maxRows: 6 }" :disabled="tableStatus === 3" type="textarea" v-model="scope.row.note" clearable>
            </el-input>
            {{ getRemark(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="兰居意见" header-align="center" v-if="tableStatus !== 0">
          <template slot-scope="scope">
            <el-input v-if="tableStatus === 1" type="textarea" :autosize="{ maxRows: 6 }" v-model="scope.row.suggestion"
              clearable>
            </el-input>
            <el-input v-else-if="tableStatus === 2 || tableStatus === 3" size="mini" disabled type="textarea"
              :autosize="{ maxRows: 6 }" v-model="scope.row.suggestion" clearable>
            </el-input>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="isManager != '0' ||  (isManager == '0' && check_CURTAIN_STATUS_ID == -1)"
        style="font-size:16px;margin-top:10px;">总计：<span style="color:red;">￥{{allTotal | dosageFilter}}</span></div>

      <!-- 购物车修改窗帘详情 -->
      <div v-if="tableStatus === 0" style="text-align: center;" class="mt20">
        <el-button type="danger" style="margin-right: 20px;" width="130px" @click="addCurtainToShoppingCar">
          保存至购物车
        </el-button>
        <el-button type="info" style="margin-left: 20px;" width="130px" @click.native="closeTable">
          返回
        </el-button>
      </div>
      <!-- 兰居审核 -->
      <div v-if="tableStatus === 1" style="text-align: center;" class="mt20">
        <el-input style="margin-bottom: 10px" resize="none" type="textarea" :rows="3" placeholder="请输入订单审核意见"
          v-model="suggestionLJ">
        </el-input>
        <el-button type="success" class="mr20" width="130px" :disabled="STATUS_ID == '0'" @click.native="resolvePass">
          确认通过
        </el-button>
        <el-button type="primary" class="ml20 mr20" width="130px" @click.native="resolveModify">
          确认修改
        </el-button>
        <el-button type="info" class="ml20" width="130px" @click.native="rejectModify">
          取消
        </el-button>
      </div>
      <!-- 用户根据兰居意见修改 -->
      <div v-if="tableStatus === 2" style="text-align: center;" class="mt20">
        <el-input style="margin-bottom: 10px" resize="none" type="textarea" :rows="3" disabled placeholder="请输入订单审核意见"
          v-model="suggestionLJ">
        </el-input>
        <el-button type="primary" class="mr20" width="130px" @click.native="resolveModify">
          确认修改
        </el-button>
        <el-button type="info" class="ml20" width="130px" @click.native="rejectModify">
          取消
        </el-button>
      </div>
      <!-- 只可查看 -->
      <div v-if="tableStatus === 3" style="text-align: center;" class="mt20">
        <el-input style="margin-bottom: 10px" resize="none" type="textarea" :rows="3" disabled placeholder="请输入订单审核意见"
          v-model="suggestionLJ">
        </el-input>
        <el-button type="danger" class="mr20" width="130px" @click.native="resolveModify">
          关闭
        </el-button>
      </div>
    </div>
    <!-- 替换列表 -->
    <el-dialog width="65%" :append-to-body="true" :visible.sync="dialogTableVisible" :close-on-click-modal="false">
      <div slot="title">
        <b>{{ dialogTitle }}</b>
      </div>
      <div v-if="items.length !== 0">
        <el-input clearable v-if="data[chooseIndex].productType !== 'GY'" placeholder="输入商品型号查找"
          style="width:250px;margin: 0 0 10px 10px;" v-model.trim="searchKey" @clear="initSearch"
          @keyup.enter.native="initSearch">
          <el-button @click="initSearch" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <br />
        <el-radio border size="small" class="mt10 ml10" v-for="item in items" :value="item.itemNo" :key="item.itemNo"
          v-model="itemNo" :label="item.itemNo">
          <span v-if="chooseType === 'LCB' || chooseType === 'GY'">
            {{ item.itemNo + " " + item.note }}
          </span>
          <span v-else>{{ item.itemNo }}</span>
        </el-radio>
        <el-pagination v-if="data[chooseIndex].productType !== 'GY'" class="tc mt10" @current-change="getAllItemNoData"
          :current-page.sync="currentPage" :page-size="limit" layout="prev, pager, next, jumper" :total="totalNumber">
        </el-pagination>
      </div>
      <div v-else style="height: 200px;">
        暂无数据
      </div>
      <footer class="mt20" style="text-align: center;">
        <el-button class="mr10" type="success" @click="chooseItemNo" plain>确定</el-button>
        <el-button class="ml10" type="danger" @click="dialogTableVisible = false" plain>取消</el-button>
      </footer>
    </el-dialog>
  </el-card>
</template>

<script>
import {
  getCurtainDetailMsg,
  getGY,
  changeDosageByNo,
  updateCurtain,
  deleteTheGroup,
} from "@/api/curtain";
import { GetDosageByNo, GetChangeItemByProductType } from "@/api/itemInfoASP";
import {
  getItemById,
  GetPromotionByItem,
  GetPromotionsById,
} from "@/api/orderListASP";
import { UpdateCartItem } from "@/api/shopASP";
import Cookies from "js-cookie";
import { mapMutations, mapActions } from "vuex";
import Axios from "axios";

export default {
  name: "detailCurtainTable",
  data() {
    return {
      cid: Cookies.get("cid"), //假定给的用户id
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      //获取真实数据
      message: {
        itemNo: "T330029",
        width: parseFloat(10.001), //成品宽度
        height: parseFloat(5.001), //成品高度
        WBH: parseFloat(1.001), //帘头外包盒宽度
        multiple: parseFloat(2.2), //褶皱倍数
        location: "123",
        groupType: "", //活动组
      },
      activityOptions: [],
      chooseBig: [true, true, true, true, true], //是否选择了大类
      spanArr0: [], //商品信息跨行的数据
      spanArr1: [], //名称跨行的数据
      spanArr2: [], //编码名称跨列，配件包专有
      pos: 0, //和spanArr对应的下标
      chooseIndex: -1, //默认选中的数据下标
      dialogTableVisible: false, //是否出现弹出层
      dialogTitle: "", //弹出层标题
      searchKey: "", //搜索的关键词
      items: [], //可供选择的全部编码
      currentPage: 1, //当前的页数
      limit: 30, //每页的个数
      totalNumber: 0, //全部编码的数量
      chooseType: "", //选中的产品类型
      itemNo: "", //选中的编码
      //接口获取到的全部数据
      allData: {},
      data: [], //表格数据
      compareData: [], //对比数据
      oldData: [], //保留最原始数据
      //窗帘大类状态
      curtainType: [],
      //风格切换：01--定宽，02--定高
      fixType: [
        {
          value: 0,
          label: "定高",
        },
        {
          value: 1,
          label: "定宽",
        },
      ],
      //根据编号查询制造说明
      part: [],
      //帘头制造说明
      part0: [
        { value: "么术贴正车" },
        { value: "么术贴反车" },
        { value: "穿/挂杆款" },
        { value: "特殊见备注" },
      ],
      //帘身、纱制造说明
      part1: [
        { value: "对开" },
        { value: "左单开" },
        { value: "右单开" },
        { value: "特殊开备注" },
      ],
      //帘身配布制造说明
      part3: [
        { value: "一个褶" },
        { value: "一个半褶" },
        { value: "二个褶" },
        { value: "二个半褶" },
        { value: "三个褶" },
        { value: "三个半褶" },
      ],
      //配件编码
      part2: [],
      suggestionLJ: "", //兰居人员总体审核意见
      check_CURTAIN_STATUS_ID: Cookies.get("CURTAIN_STATUS_ID"),
    };
  },
  props: [
    "headerData",
    "curtainData",
    "tableStatus",
    "suggestion",
    "isModified",
    "STATUS_ID",
  ],
  computed: {
    salPromotion() {
      var selectActivity = this.activityOptions.filter((item) => item.P_ID == this.headerData.activityId);
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      //找到勾选的
      let _curtainData = JSON.parse(JSON.stringify(this.data));
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            if (this.chooseBig[0] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "ls":
            if (this.chooseBig[1] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "lspb":
            if (this.chooseBig[2] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "sha":
            if (this.chooseBig[3] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
        }
      }
      let totalMoney = 0;
      for (let i = 0; i < _curtainData.length; i++) {
        if (_curtainData[i].choose != false) {
          totalMoney = totalMoney.add(this.oneTotal(_curtainData[i]));
        }
      }
      return totalMoney;
    },
  },
  methods: {
    //修改配件包时，对应修改单位以及名称说明
    changePJBUnit(index) {
      let _data = this.data[index].item.itemNo;
      this.part2.forEach((item) => {
        if (item.value === _data) {
          this.data[index].unit = item.unit;
          this.data[index].curtainItemName = item.note;
          var price = this.getPrice(this.customerType, item.item);
          this.data[index].price = price;
          this.judgeTip(this.data[index], index);
          return;
        }
      });
    },
    //大类和二类的联动
    changeLink(type, index) {
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].itemType === type) {
          this.data[i].choose = this.chooseBig[index];
        }
      }
      if (type == "ls") {
        this.chooseBig[2] = this.chooseBig[index];
        //勾选掉帘身时也同时不要帘身配布
        this.changeLink("lspb", 2);
      }
      this.changeLinkTip(type, index);
    },
    //大类和二类的反向联动
    changeLinkReverse(data) {
      let _index;
      let _arr = this.getBigType(data.itemType);
      let flag = true;
      switch (data.itemType) {
        case "lt":
          _index = 0;
          break;
        case "ls":
          _index = 1;
          break;
        case "lspb":
          _index = 2;
          break;
        case "sha":
          _index = 3;
          break;
        case "pjb":
          _index = 4;
          break;
        default:
          _index = -1;
      }
      /**
       * 8.22新需求
       * 帘头改为配件包的勾选方式
       * 即取消双向绑定，帘头固定
       */
      if (_index >= 1 && _index <= 4) {
        _arr.forEach((item) => {
          if (item.deleteFlag !== "Y" || item.choose === true) {
            flag = false;
          }
        });
        if (data.choose || flag) {
          this.chooseBig[_index] = data.choose;
          this.changeLinkTip(data.itemType, _index);
        }
      }
    },
    changeLinkTip(type, index) {
      if (type == "lspb") {
        //取消帘身配布如果帘身没有取消，需要在帘身工艺中备注
        //如果帘身也取消了，就改回来
        //找到工艺数据
        var gyData = this.data.filter(
          (item) => item.itemType == "ls" && item.productType == "GY"
        );
        if (gyData.length) {
          gyData = gyData[0];
          if (this.chooseBig[1] && !this.chooseBig[2]) {
            gyData.note = "已取消购买帘身配布;" + gyData.note;
          } else {
            gyData.note = gyData.note.replace("已取消购买帘身配布;", "");
          }
        }
      }
    },
    //获取某个大类的全部数据
    getBigType(type) {
      let arr = [];
      this.data.forEach((item) => {
        if (item.itemType === type) {
          arr.push(item);
        }
      });
      return arr;
    },
    getActivity() {
      //判断活动是否存在，不存在的话将activityId转为activityName，让选择器显示
      if (this.headerData.activityEffective === false) {
        this.headerData.activityId = this.headerData.activityName;
      }
      this.activityOptions = [];
      if (this.customerType == "110") {
        GetPromotionsById({ PID: this.headerData.activityId }).then((res) => {
          this.activityOptions = res.data;
        });
      } else {
        getItemById(
          { itemNo: this.headerData.modelNumber },
          { loading: false }
        ).then((itemRes) => {
          GetPromotionByItem(
            {
              cid: this.cid,
              customerType: this.customerType,
              itemNo: itemRes.data.ITEM_NO,
              itemVersion: itemRes.data.ITEM_VERSION,
              productType: itemRes.data.PRODUCT_TYPE,
              productBrand: itemRes.data.PRODUCT_BRAND,
            },
            { loading: false }
          ).then((res) => {
            this.activityOptions = res.data;
            this.activityOptions.push({
              ORDER_TYPE: "",
              ORDER_NAME: "不参与活动",
              P_ID: null,
            });
          });
        });
      }
    },
    //关闭表格
    closeTable() {
      this.addTab("shoppingCar/shopping?curtain");
      this.closeTab("detail/detailCurtain");
    },
    //确认通过
    resolvePass() {
      //已经修改后，二次确认
      if (this.isModified === 1) {
        this.$confirm("此窗帘已经修改了，依然确认通过吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        })
          .then(() => {
            this.$emit("visible", false);
            this.$emit("finalData", 1);
            this.$emit("suggest", this.suggestionLJ);
          })
          .catch(() => { });
      }
      //非修改
      else {
        //同一过滤
        let _data = JSON.parse(JSON.stringify(this.data));
        var _data_temp = [];
        _data.forEach((item) => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          _data_temp.push(JSON.parse(JSON.stringify(item)));
        });
        //把不需要比对的备注和意见拿出来
        _data_temp.forEach((item) => {
          item.note = "";
          item.suggestion = "";
        });
        var oldData_temp = [];
        this.oldData.forEach((item) => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          oldData_temp.push(JSON.parse(JSON.stringify(item)));
        });
        //把不需要比对的备注和意见拿出来
        oldData_temp.forEach((item) => {
          item.note = "";
          item.suggestion = "";
        });
        //备注修改可以通过，同时保存备注
        if (JSON.stringify(oldData_temp) !== JSON.stringify(_data_temp)) {
          this.$confirm(
            "您已经修改过此套窗帘，确认只会保存备注，依然确认通过吗？",
            "提示",
            {
              confirmButtonText: "确定",
              type: "info",
            }
          )
            .then(() => {
              this.$emit("visible", false);
              this.$emit("finalData", _data, 1);
              this.$emit("suggest", this.suggestionLJ);
            })
            .catch(() => { });
        } else {
          this.$emit("visible", false);
          this.$emit("finalData", _data, 1);
          this.$emit("suggest", this.suggestionLJ);
        }
      }
    },
    //确认修改
    resolveModify() {
      //返回过滤后的数据
      //同时返回删除的配件的标识id
      let _data = JSON.parse(JSON.stringify(this.data));
      let _deleteArr = [];
      for (let i = _data.length - 1; i >= 0; i--) {
        if (!_data[i].choose || !_data[i].item.itemNo) {
          _deleteArr.unshift(_data[i].id);
          _data.splice(i, 1);
        }
      }
      if (_data.length === 0) {
        this.$alert("请至少选择一款配件!", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      for (let i = 0; i < _data.length; i++) {
        let item = _data[i];
        if (
          (item.manufacturingInstructions === "特殊见备注" ||
            item.manufacturingInstructions === "特殊开备注") &&
          (!item.note || item.note === "")
        ) {
          this.$alert(`请填写${item.manufacturingInstructions}的备注`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return;
        }
      }
      this.$emit("visible", false);
      this.$emit("finalData", _data);
      this.$emit("suggest", this.suggestionLJ);
      this.$emit("deleteArr", _deleteArr);
    },
    //取消修改
    rejectModify() {
      this.$emit("visible", false);
      //this.$emit('finalData',null);
    },
    //点击更换编码名称
    getNewItemNo(data, index) {
      this.itemNo = "";
      this.searchKey = "";
      this.items = [];
      this.dialogTableVisible = true;
      this.dialogTitle = `【${this.getProductName(data.productType)}】类产品列表`;
      this.chooseIndex = index;
      this.chooseType = data.productType;
      if (data.productType !== "GY") {
        this.initSearch();
      } else {
        this.getTheGY(this.headerData.modelNumber);
      }
    },
    initSearch() {
      this.currentPage = 1;
      this.getAllItemNoData();
    },
    //获取可修改的全部编码
    getAllItemNoData() {
      this.items = [];
      GetChangeItemByProductType({
        productType: this.chooseType,
        condition: this.searchKey.toUpperCase(),
        limit: this.limit,
        page: this.currentPage,
      }).then(res => {
        this.items = res.data;
        this.totalNumber = res.count;
      }).catch((err) => { });
    },
    getPrice(type, item) {
      var price = 0;
      if (item) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.priceSale;
        } else if (type == "05") {
          price = item.salePrice;
        } else if (type == "06") {
          price = item.priceFx;
        } else if (type == "09") {
          price = item.priceHome;
        }
      }
      return price;
    },
    //修改编码--影响用量
    chooseItemNo() {
      if (!this.itemNo) {
        this.$alert("请选择一个产品", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (this.chooseIndex < 0) {
        this.dialogTableVisible = false;
        return;
      }
      let _productType = this.data[this.chooseIndex].productType;
      let status = _productType === "ML" ? true : false;
      let status1 = _productType === "GY" ? true : false;
      this.dialogTableVisible = false;
      //修改对应的名称规格
      let data = this.items.find((v) => {
        if (v.itemNo === this.itemNo) return v;
      });
      var price = this.getPrice(this.customerType, data);
      this.data[this.chooseIndex].curtainItemName = data.note;
      this.data[this.chooseIndex].specification = data.fixGrade / 1000;
      this.data[this.chooseIndex].price = price;
      let theFixType;
      if (this.data[this.chooseIndex].itemType === "lspb") {
        this.data[this.chooseIndex].certainHeightWidth = null;
        this.data[this.chooseIndex].item.itemNo = this.itemNo;
        this.judgeTip(this.data[this.chooseIndex], this.chooseIndex);
        //库存
        this.data = this.getStoreData(this.data);
        return;
      }
      if (data.fixType === "01") {
        theFixType = 1;
      } else if (data.fixType === "02") {
        theFixType = 0;
      }
      this.data[this.chooseIndex].certainHeightWidth = theFixType;
      this.curtainData[this.chooseIndex].certainHeightWidth = theFixType;
      this.compareData[this.chooseIndex].certainHeightWidth = theFixType;
      if (!status1 && this.data[this.chooseIndex].itemType !== "lspb") {
        //修改用量
        let _headerData = this.headerData;
        let index = this.chooseIndex;
        let _outsourcingBoxWidth =
          _headerData.outsourcingBoxExist === 0
            ? "0"
            : _headerData.outsourcingBoxWidth;
        let _fixType = this.data[index].certainHeightWidth === 0 ? "02" : "01";
        let obj = {
          width: _headerData.width.toString(),
          height: _headerData.height.toString(),
          WBH:
            _outsourcingBoxWidth === null
              ? "0"
              : _outsourcingBoxWidth.toString(),
          multiple: _headerData.drape.toString(),
          parentItemNo: _headerData.modelNumber,
          itemNO: this.itemNo,
          itemType: this.data[index].itemType,
          fixType: _fixType,
        };
        GetDosageByNo(obj)
          .then((res) => {
            if (res.data.length == 0) {
              this.$alert("用量获取失败", "提示", {
                confirmButtonText: "好的",
                type: "warning",
              });
              return;
            }
            let _data = this.data[this.chooseIndex];
            let keys;
            // if (_data.itemType == "lt")
            //   keys = Math.round(res.data[0].dosage * 100) / 100;
            // else keys = Math.round(res.data[0].dosage * 10) / 10;
            keys = Math.round(res.data[0].dosage * 100) / 100;
            //绣花边只需要修改自身，无需修改面料
            if (_data.productType === "XHB") {
              this.data[this.chooseIndex].dosage = keys;
            }
            //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
            else if (_data.productType === "ML") {
              this.updateDosage(_data.itemType, keys);
            }
            this.data[this.chooseIndex].item.itemNo = this.itemNo;
            this.judgeTip(this.data[this.chooseIndex], this.chooseIndex);
            //库存
            this.data = this.getStoreData(this.data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (status1) {
        this.data[this.chooseIndex].item.itemNo = this.itemNo;
        this.judgeTip(this.data[this.chooseIndex], this.chooseIndex);
        //库存
        this.data = this.getStoreData(this.data);
        if (this.data[this.chooseIndex].item.itemNo === "GY-003") {
          this.data[this.chooseIndex].dosage = this.curtainData[
            this.chooseIndex
          ].dosage;
        } else {
          for (let i = 0; i < this.data.length; i++) {
            if (
              this.data[i].itemType === this.data[this.chooseIndex].itemType &&
              i !== this.chooseIndex
            ) {
              if (this.data[i].productType === "ML") {
                this.data[this.chooseIndex].dosage = this.data[i].dosage;
                break;
              }
            }
          }
        }
      }
    },
    //修改风格
    changeDosageByFixtype(index) {
      let _headerData = this.headerData;
      let _outsourcingBoxWidth =
        _headerData.outsourcingBoxExist === 0
          ? "0"
          : _headerData.outsourcingBoxWidth;
      let _fixType = this.data[index].certainHeightWidth === 0 ? "02" : "01";
      let obj = {
        width: _headerData.width.toString(),
        height: _headerData.height.toString(),
        WBH:
          _outsourcingBoxWidth === null ? "0" : _outsourcingBoxWidth.toString(),
        multiple: _headerData.drape.toString(),
        parentItemNo: _headerData.modelNumber,
        itemNO: this.data[index].item.itemNo,
        itemType: this.data[index].itemType,
        fixType: _fixType,
      };
      //changeDosageByNo(obj)
      GetDosageByNo(obj)
        .then((res) => {
          if (res.data.length == 0) {
            this.$alert("用量获取失败", "提示", {
              confirmButtonText: "好的",
              type: "warning",
            });
            return;
          }
          let _data = this.data[index];
          let keys;
          // if (_data.itemType == "lt")
          //   keys = Math.round(res.data[0].dosage * 100) / 100;
          // else keys = Math.round(res.data[0].dosage * 10) / 10;
          keys = Math.round(res.data[0].dosage * 100) / 100;
          //绣花边只需要修改自身，无需修改面料
          if (_data.productType === "XHB") {
            this.data[index].dosage = keys;
          }
          //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
          else if (_data.productType === "ML") {
            this.updateDosage(_data.itemType, keys);
          }
          this.judgeTip(this.data[index], index);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //获取产品类别名称
    getProductName(val) {
      switch (val) {
        case "PJB":
          return "配件包/挂袋";
        case "XHB":
          return "绣花边";
        case "ZX":
          return "增项服务";
        case "MLP":
          return "面料(配布)";
        case "CPL":
          return "成品帘";
        case "SSDX":
          return "缩水定型";
        case "LCB":
          return "里衬布";
        case "KS":
          return "帘头";
        case "ML":
          return "面料(主布)";
        case "GY":
          return "工艺";
        case "WBH":
          return "外包盒";
        default:
          return "其它";
      }
    },
    //获取窗帘大类名称
    getTypeName(val) {
      switch (val) {
        case "lt":
          return "帘头";
        case "ls":
          return "帘身";
        case "lspb":
          return "帘身配布";
        case "sha":
          return "纱";
        case "pjb":
          return "配件";
        default:
          return val;
      }
    },
    //动态修改大类的全部用量
    updateDosage(itemType, dosage) {
      for (let i = 0; i < this.data.length; i++) {
        let pType = this.curtainData[i].productType;
        if (
          this.curtainData[i].itemType === itemType &&
          pType !== "LCB" &&
          pType !== "XHB"
        ) {
          if (this.data[i].item.itemNo !== "GY-003") {
            this.data[i].dosage = dosage;
          } else {
            this.data[i].dosage = this.curtainData[i].dosage;
          }
        }
      }
    },
    //获取备注文字
    getRemark(data) {
      if (data.certainHeightWidth === 0) {
        if (
          data.specification < this.headerData.height &&
          data.specification > 0
        ) {
          return "超高帘，用量待审核!!";
        }
      }
      return "";
    },
    //通过编号获取工艺
    getTheGY(itemNo) {
      let data = {
        itemNO: itemNo,
      };
      this.currentPage = 1;
      getGY(data)
        .then((res) => {
          this.items = res.itemList;
          this.totalNumber = res.itemList.length;
        })
        .catch((err) => {
          this.items = [];
          this.totalNumber = 0;
        });
    },
    //动态判断制造说明
    judgeTip(data, index) {
      let status = -1;
      if (
        data.certainHeightWidth === 0 &&
        this.compareData[index].certainHeightWidth === 1
      ) {
        status = 1;
      }
      if (
        data.certainHeightWidth === 1 &&
        this.compareData[index].certainHeightWidth === 0
      ) {
        status = 2;
      }
      if (data.item.itemNo !== this.compareData[index].item.itemNo) {
        if (status === 1) status = 4;
        else if (status === 2) status = 5;
        else status = 3;
      }
      if (
        //data.itemType === "pjb" ||
        data.productType === "LCB" ||
        data.productType == "GY"
      ) {
        status = -1;
      }
      switch (status) {
        case 1:
          this.data[index].illustrate = "修改为定高";
          break;
        case 2:
          this.data[index].illustrate = "修改为定宽";
          break;
        case 3:
          this.data[index].illustrate = "非标配";
          break;
        case 4:
          this.data[index].illustrate = "修改为定高，非标配";
          break;
        case 5:
          this.data[index].illustrate = "修改为定宽，非标配";
          break;
        default:
          this.data[index].illustrate = " ";
      }
    },
    //清空记录的行数据
    clearArr() {
      this.spanArr0 = [];
      this.spanArr1 = [];
      this.spanArr2 = [];
    },
    //通过数据动态获取行数数据
    getSpanArr(msg) {
      let data = msg;
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr0.push(data.length);
          this.spanArr1.push(1);
          this.pos = 0;
          this.curtainType.push({
            name: data[i].itemType,
            value: true,
          });
        } else {
          this.spanArr0.push(0);
          // 判断当前元素与上一个元素是否相同
          if (data[i].itemType === data[i - 1].itemType) {
            this.spanArr1[this.pos] += 1;
            this.spanArr1.push(0);
          } else {
            this.spanArr1.push(1);
            this.pos = i;
            this.curtainType.push({
              name: data[i].itemType,
              value: true,
            });
          }
        }
      }
    },
    //通过数组合并行
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        let _row = this.spanArr0[rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
      if (columnIndex === 1) {
        let _row = this.spanArr1[rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
      if (columnIndex === 2) {
        if (
          row.itemType === "pjb" &&
          row.changeFlag === "Y" &&
          this.tableStatus !== 3
        ) {
          return {
            rowspan: 1,
            colspan: 2,
          };
        }
      }
      if (columnIndex === 3) {
        if (
          row.itemType === "pjb" &&
          row.changeFlag === "Y" &&
          this.tableStatus !== 3
        ) {
          return {
            rowspan: 1,
            colspan: 0,
          };
        }
      }
    },
    //添加窗帘入购物车
    addCurtainToShoppingCar() {
      if (this.headerData.activityId === this.headerData.activityName) {
        this.$alert("请选择合适的活动", "提示", {
          type: "warning",
          confirmButtonText: "确定",
        });
        return;
      }
      let _curtainData = JSON.parse(JSON.stringify(this.data));
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            if (this.chooseBig[0] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "ls":
            if (this.chooseBig[1] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "lspb":
            if (this.chooseBig[2] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
          case "sha":
            if (this.chooseBig[3] === false) {
              _curtainData.splice(i--, 1);
            }
            break;
        }
      }
      for (let i = 0; i < _curtainData.length; i++) {
        let _itemType = _curtainData[i].itemType;
        let _manufacturingInstructions =
          _curtainData[i].manufacturingInstructions;
        if (_itemType === "ls" || _itemType === "sha" || _itemType === "lspb") {
          if (_curtainData[i].productType === "ML") {
            if (_manufacturingInstructions === "" && _curtainData[i].choose) {
              this.$alert("制造说明不能为空", "提示", {
                confirmButtonText: "好的",
                type: "warning",
              });
              return;
            }
          }
        }
        if (
          _itemType === "lt" &&
          _curtainData[i].productType !== "XHB" &&
          _manufacturingInstructions === "" &&
          _curtainData[i].choose
        ) {
          this.$alert("制造说明不能为空", "提示", {
            confirmButtonText: "好的",
            type: "warning",
          });
          return;
        }
        if (
          _manufacturingInstructions === "特殊见备注" ||
          _manufacturingInstructions === "特殊开备注"
        ) {
          if (this.isNull(_curtainData[i].note)) {
            this.$alert("特殊开的备注不能为空", "提示", {
              confirmButtonText: "好的",
              type: "warning",
            });
            return;
          }
        }
      }
      let _curtainLists = [];
      let _deleteId = [];
      let _data = [
        { name: "lt", number: 0 },
        { name: "ls", number: 0 },
        { name: "lspb", number: 0 },
        { name: "sha", number: 0 },
        { name: "pjb", number: 0 },
      ];
      //判断个数
      for (let i = 0; i < _curtainData.length; i++) {
        switch (_curtainData[i].itemType) {
          case "lt":
            _data[0].number++;
            break;
          case "ls":
            _data[1].number++;
            break;
          case "lspb":
            _data[2].number++;
            break;
          case "sha":
            _data[3].number++;
            break;
          case "pjb":
            _data[4].number++;
          default:
            break;
        }
      }
      let _index = [0, 0, 0, 0, 0];
      for (let i = 0; i < _data.length; i++) {
        for (let k = i; k >= 0; k--) {
          _index[i] += _data[k].number;
        }
      }
      for (let i = 0; i < _data.length; i++) {
        if (_data[i].number === 0) continue;
        let _obj = {
          partName: this.getTypeName(_data[i].name),
          curtainCommodities: [],
        };
        let j = 0;
        for (let k = i; k > 0; k--) {
          j += _data[k - 1].number;
        }
        for (; j < _index[i]; j++) {
          if (!_curtainData[j].choose || !_curtainData[j].item.itemNo) {
            _deleteId.push(_curtainData[j].id);
            continue;
          }
          let _obj1 = {
            id: _curtainData[j].id,
            cartItemId: _curtainData[j].cartItemId,
            price: _curtainData[j].price,
            activityId: this.salPromotion.P_ID,
            item: {
              itemNo: _curtainData[j].item.itemNo,
            },
            quantity: _curtainData[j].quantity,
            width: _curtainData[j].width,
            height: _curtainData[j].height,
            note: _curtainData[j].note,
            unit: _curtainData[j].unit,
            status: _curtainData[j].status,
            curtainItemName: _curtainData[j].curtainItemName,
            curtainPartName: _curtainData[j].curtainPartName,
            dosage: _curtainData[j].dosage,
            manufacturingInstructions:
              _curtainData[j].manufacturingInstructions,
            certainHeightWidth: _curtainData[j].certainHeightWidth,
            specification: _curtainData[j].specification,
            illustrate: _curtainData[j].illustrate,
            deleteFlag: _curtainData[j].deleteFlag,
            modifyFlag: _curtainData[j].modifyFlag,
            changeFlag: _curtainData[j].changeFlag,
            inlineNo: _curtainData[j].inlineNo,
          };
          _obj.curtainCommodities.push(_obj1);
        }
        if (_obj.curtainCommodities.length !== 0) {
          _curtainLists.push(_obj);
        }
      }
      if (
        _curtainLists.length === 0 ||
        (_curtainLists.length === 1 &&
          _curtainLists[0].partName === "配件" &&
          _curtainLists[0].curtainCommodities.length === 0)
      ) {
        this.$alert("请至少选择一款配件!", "提示", {
          confirmButtonText: "好的",
          type: "warning",
        });
        return;
      }
      let obj = {
        customerType: this.customerType,
        curtainLists: _curtainLists,
      };
      if (_deleteId.length > 0) {
        deleteTheGroup(_deleteId)
          .then((res) => {
            //console.log(res)
          })
          .catch((err) => {
            //console.log(err)
          });
      }
      updateCurtain(obj)
        .then((res) => {
          UpdateCartItem({
            CART_ITEM_ID: this.headerData.cartItemId,
            ACTIVITY_GROUP_TYPE: this.salPromotion.GROUP_TYPE,
            UpdateColumns: ["ACTIVITY_GROUP_TYPE"],
          }).then((res2) => {
            this.$alert("修改成功!", "提示", {
              confirmButtonText: "好的",
              type: "success",
            });
            this.addTab("shoppingCar/shopping?curtain");
            this.closeTab("detail/detailCurtain");
          });
        })
        .catch((err) => {
          this.$alert(err.msg, "提示", {
            confirmButtonText: "好的",
            type: "warning",
          });
        });
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"]),
    //判空
    isNull(str) {
      if (str === "" || str === undefined || str === null) return true;
      var regu = "^[ ]+$";
      var re = new RegExp(regu);
      return re.test(str);
    },
    //获取原对比数据
    async getOldData(data) {
      if (this.tableStatus === 3) return;
      this.compareData = JSON.parse(JSON.stringify(this.curtainData));
      this.part2 = [];
      GetChangeItemByProductType({
        productType: "PJB",
        condition: "",
        limit: 999,
        page: 1,
      }).then(res => {
        let _arr = [];
        res.data.forEach((item) => {
          _arr.push({
            label: `${item.itemNo}:${item.note}`,
            value: item.itemNo,
            unit: item.unit,
            note: item.note,
            item: item,
          });
        });
        _arr.sort(function (a, b) {
          return a.value > b.value ? 1 : -1; //升序
        });
        _arr.push({
          label: "-未选择配件包-",
          value: null,
          unit: "",
          note: "",
        });
        this.part2 = _arr;
      })
        .catch((err) => {
          this.part2 = [];
        });
      let obj = {
        itemNO: data.modelNumber.toString(),
        width: data.width.toString(),
        height: data.height.toString(),
        WBH: data.outsourcingBoxExist
          ? data.outsourcingBoxWidth.toString()
          : "0",
        multiple: data.drape.toString(),
        location: data.location,
      };
      getCurtainDetailMsg(obj).then(async (res) => {
        let _data = res.itemList;
        for (let index = 0; index < this.compareData.length; index++) {
          for (let i = 0; i < _data.length; i++) {
            if (
              Number(_data[i].itemMLGY.no) ===
              Number(this.compareData[index].inlineNo)
            ) {
              this.compareData[index].item.itemNo = _data[i].itemNo;
              let _comData = this.compareData[index];
              if (
                _comData.certainHeightWidth !== null &&
                _comData.productType === "ML"
              ) {
                let _itemObj = {
                  productType: _comData.productType,
                  condition: this.data[index].item.itemNo,
                  limit: 1,
                  page: 1,
                };
                let ress = await GetChangeItemByProductType(_itemObj);
                if (ress.data.length > 0) {
                  this.compareData[index].certainHeightWidth =
                    ress.data[0].fixType === "02" ? 0 : 1;
                }
              }
              break;
            }
          }
        }
      });
    },
    //大类二类的勾选联动，是否出现×号
    bigToSmall: function (data) {
      let index = -1;
      switch (data.itemType) {
        case "lt":
          index = 0;
          break;
        case "ls":
          index = 1;
          break;
        case "lspb":
          index = 2;
          break;
        case "sha":
          index = 3;
          break;
        case "pjb":
          index = 4;
        default:
          index = -1;
      }
      if (index >= 0 && index <= 4) {
        if (this.chooseBig[index] === false || !data.choose) {
          return true;
        }
      }
      return false;
    },
    oneTotal(row) {
      var price = this.calculatePromotionPrice(row);
      if (row.dosage == undefined) row.dosage = 0;
      return price.mul(row.dosage);
    },
    calculatePromotionPrice(data) {
      var price = 0;
      //首先判断TYPE,1折扣，2定价
      if (this.salPromotion && this.salPromotion.P_ID) {
        switch (this.salPromotion.TYPE) {
          case "1":
            //折扣
            price = data.price.mul(this.salPromotion.DISCOUNT);
            break;
          case "2":
            //定价
            price = this.salPromotion.PRICE;
        }
      } else {
        price = data.price;
      }
      return this.dosageFilter(price);
    },
    //查找库存
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        if (!oneCurtain.item.itemNo) continue;
        if (oneCurtain.productType == 'GY' || oneCurtain.productType == 'PJB') continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: oneCurtain.item.itemNo,
        };
        Axios.defaults.withCredentials = false;
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var store_charge = "";
            var ddz = 0;
            var kucun = res.data.data.kucun ? res.data.data.kucun : 0;
            var dinghuoshu = res.data.data.dinghuoshu ? res.data.data.dinghuoshu : 0;
            var xiaxian = res.data.data.xiaxian ? res.data.data.xiaxian : 0;
            var store_num = kucun - dinghuoshu;
            if (store_num >= xiaxian) {
              store_charge = "充足";
            } else if (store_num > 0 && store_num < xiaxian) {
              store_charge = "量少待查";
            } else if (store_num < 0) {
              store_charge = "欠料待审";
            }
            var data = originData.filter((item) => item.item.itemNo == res.data.data.code);
            if (data.length) {
              for (var j = 0; j < data.length; j++) {
                data[j].curtain_store = store_charge;
              }
            }
          }
        }).catch(res => { });
      }
      return originData;
    },
  },
  activated() {
    for (var i = 0; i < this.curtainData.length; i++) {
      this.$set(this.curtainData[i], "curtain_store", "");
    }
    this.getActivity();
    //按规则排序
    this.curtainData.sort(function (a, b) {
      let rule = ["lt", "ls", "lspb", "sha", "pjb"];
      return rule.indexOf(a.itemType) - rule.indexOf(b.itemType);
    });
    this.data = JSON.parse(JSON.stringify(this.curtainData));
    this.oldData = JSON.parse(JSON.stringify(this.curtainData));
    this.getOldData(this.headerData);
    this.clearArr();
    this.getSpanArr(this.data);
    if (this.suggestion) this.suggestionLJ = this.suggestion.toString();
    //获得库存
    this.data = this.getStoreData(this.data);
  },
};
</script>

<style scoped>
#messageRight {
  margin: 20px 40px;
  display: inline-block;
  vertical-align: middle;
}
#messageRight tr td:nth-child(1) {
  text-align: right;
}
#messageRight tr td:nth-child(2) {
  padding-left: 20px;
}
#messageRight td {
  padding: 5px;
  font-size: 14px;
}
#curtainTable tr td {
  padding: 6px 3px;
}
#shoppingMsg > p {
  margin: 20px auto;
}
.messageBox > div {
  padding: 5px 0;
}
.messageInput {
  border: 1px solid #c3c3c3;
  margin-right: 3px;
  padding: 3px 6px 3px 6px;
  min-width: 65px;
  border-radius: 4px;
  color: gray;
  display: inline-block;
}
</style>

<style>
.curtainTable .el-table td,
.curtainTable .el-table th {
  padding: 0 !important;
}
.curtainTable .el-table .cell {
  padding: 0 2px !important;
}
.curtainTable .el-input__inner {
  padding: 0 5px;
  height: 24px;
}
.curtainTable .el-input__icon {
  line-height: 24px;
}
.curtainTable .el-textarea__inner {
  padding: 5px;
}
.curtainTable .el-checkbox__label {
  padding-left: 2px;
}
</style>