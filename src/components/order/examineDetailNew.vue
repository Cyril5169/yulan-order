<template>
  <el-card class="centerCard">
    <el-dialog title="窗帘详情" :show-close="false" :visible.sync="detailVisible" :close-on-click-modal="false" width="95%"
      top="5vh">
      <keep-alive>
        <detailCurtainTable v-if="detailVisible" v-bind:tableStatus="tableStatus" v-bind:STATUS_ID="STATUS_ID"
          v-bind:isModified="isModified" v-bind:headerData="headerData" v-bind:curtainData="curtainData"
          v-bind:suggestion="ljsuggestion" v-on:visible="closeTheDialog" v-on:finalData="getFinalData"
          v-on:deleteArr="getDeleteArr" v-on:suggest="getSuggest"></detailCurtainTable>
      </keep-alive>
    </el-dialog>

    <el-card class="tableCard" shadow="hover">
      <div slot="header">
        <span class="zoomLeft">
          订单号：
          <span class="zoomRight">{{ ruleForm.ORDER_NO }}</span>
        </span>
        <span class="zoomLeft">
          经办人：
          <span class="zoomRight">{{ ruleForm.LINKPERSON }}({{ ruleForm.TELEPHONE }})</span>
        </span>
        <span class="zoomLeft">
          收货人：
          <span class="zoomRight">{{ ruleForm.WL_CONTACTS }}({{ ruleForm.WL_TEL }})</span>
        </span>
        <br />
        <span class="zoomLeft">
          收货地址：
          <span class="zoomRight">{{ ruleForm.ALL_ADDRESS }}</span>
        </span>
        <span class="zoomLeft">
          订单备注：
          <span class="zoomRight">{{ ruleForm.NOTES }}</span>
        </span>
        <br />
        <span class="zoomLeft">
          玉兰处理说明：
          <span class="zoomRight">{{ ruleForm.YULAN_NOTES }}</span>
        </span>
      </div>
      <el-table border :data="ruleForm.ORDERBODY" style="width: 100%" :row-class-name="tableRowClassName"
        :expand-row-keys="expands" :row-key="getRowKeys">
        <el-table-column width="1" type="expand">
          <template slot-scope="scope">
            <div style="margin:10px;" class="curtainTable">
              <el-table style="width:100%;font-size:12px;" border :data="scope.row.curtains" :span-method="
                  function(col) {
                    return cellMerge(col, scope.$index);
                  }
                ">
                <el-table-column width="120" header-align="center" label="商品信息">
                  <template>
                    <div class="messageBox">
                      <div>
                        <label>款号:</label>
                        <div class="messageInput">
                          {{ ruleForm.headerData[scope.$index].modelNumber }}
                        </div>
                      </div>
                      <div>
                        <label>成品宽:</label>
                        <div class="messageInput">
                          {{ ruleForm.headerData[scope.$index].width }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>成品高:</label>
                        <div class="messageInput">
                          {{ ruleForm.headerData[scope.$index].height }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>假帘高:</label>
                        <div class="messageInput">
                          {{ ruleForm.headerData[scope.$index].highJia }}
                        </div>
                        m
                      </div>
                      <div>
                        <label>褶皱倍数:</label>
                        <div class="messageInput">
                          {{ ruleForm.headerData[scope.$index].drape }}
                        </div>
                      </div>
                      <div>
                        <label>帘头外包盒单边宽度:</label>
                        <div v-if="
                            ruleForm.headerData[scope.$index]
                              .outsourcingBoxExist === 1 &&
                              ruleForm.headerData[scope.$index]
                                .outsourcingBoxWidth != 0
                          " class="messageInput">
                          {{
                            ruleForm.headerData[scope.$index]
                              .outsourcingBoxWidth
                          }}
                        </div>
                        <div v-else class="messageInput">无</div>
                        m
                      </div>
                      <div>
                        <label>位置:</label>
                        <div class="messageInput" style="width: 70px;">
                          {{
                            ruleForm.headerData[scope.$index].location ===
                              null ||
                            ruleForm.headerData[scope.$index].location === ""
                              ? "无"
                              : ruleForm.headerData[scope.$index].location
                          }}
                        </div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="名称" header-align="center" width="70">
                  <template slot-scope="scope1">
                    {{ getTypeName(scope1.row.curtainPartName) }}
                    <!-- <br> -->
                    <span v-if="tableStatus !== 3">
                      <el-checkbox @change="changeLink('ls', 1, scope.$index)" v-if="scope1.row.itemType === 'ls'"
                        v-model="chooseBig[scope.$index][1]">
                        <span v-if="chooseBig[scope.$index][1] == false" style="color: red;">×</span>
                      </el-checkbox>
                      <el-checkbox @change="changeLink('lspb', 2, scope.$index)" v-if="scope1.row.itemType === 'lspb'"
                        v-model="chooseBig[scope.$index][2]">
                        <span v-if="chooseBig[scope.$index][2] == false" style="color: red;">×</span>
                      </el-checkbox>
                      <el-checkbox @change="changeLink('sha', 3, scope.$index)" v-if="scope1.row.itemType === 'sha'"
                        v-model="chooseBig[scope.$index][3]">
                        <span v-if="chooseBig[scope.$index][3] == false" style="color: red;">×</span>
                      </el-checkbox>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="编码" header-align="center" width="125">
                  <template slot-scope="scope1">
                    <div>
                      <span v-if="tableStatus === 3">
                        {{ scope1.row.item.itemNo }}
                      </span>
                      <span v-else-if="
                          scope1.row.itemType === 'pjb' &&
                            scope1.row.changeFlag === 'Y'
                        ">
                        <el-select size="mini" v-model="scope1.row.item.itemNo" placeholder="请选择"
                          @change="changePJBUnit(scope1.$index, scope.$index)">
                          <el-option v-for="item in part2" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </span>
                      <span v-else-if="scope1.row.changeFlag === 'Y'">
                        <a class="uline" @click="
                            getNewItemNo(
                              scope1.row,
                              scope1.$index,
                              scope.$index
                            )
                          ">
                          {{ scope1.row.item.itemNo }}
                        </a>
                        <el-checkbox class="ml5" v-if="scope1.row.deleteFlag === 'Y'"
                          v-model="chooseSamll[scope.$index][scope1.$index]" @change="
                            changeLinkReverse(
                              scope1.row,
                              scope1.$index,
                              scope.$index
                            )
                          ">
                        </el-checkbox>
                      </span>
                      <span v-else>
                        {{ scope1.row.item.itemNo }}
                        <el-checkbox class="ml5" v-if="scope1.row.deleteFlag === 'Y'"
                          v-model="chooseSamll[scope.$index][scope1.$index]" @change="
                            changeLinkReverse(
                              scope1.row,
                              scope1.$index,
                              scope.$index
                            )
                          ">
                        </el-checkbox>
                      </span>
                      <span v-if="
                          bigToSmall(scope1.row) == true && tableStatus !== 3
                        " style="color: red;">
                        ×
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="名称" header-align="center" width="110">
                  <template slot-scope="scope1">
                    <div v-if="
                        scope1.row.curtainItemName !== null &&
                          scope1.row.curtainItemName !== ''
                      ">
                      {{ scope1.row.curtainItemName }}
                    </div>
                    <div v-else>{{ getTypeName(scope1.row.itemType) }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="单价" align="center" width="40">
                  <template slot-scope="scope">
                    <span>
                      {{ scope.row.price }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="规格:米/对" header-align="center" align="center" width="50">
                  <template slot-scope="scope1">
                    {{
                      scope1.row.specification === 0 ||
                      scope1.row.specification === null
                        ? "--"
                        : scope1.row.specification
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="面料属性" width="80" header-align="center" align="center">
                  <template slot-scope="scope1">
                    <div v-if="
                        scope1.row.certainHeightWidth !== null &&
                          scope1.row.productType === 'ML'
                      ">
                      <el-select :disabled="tableStatus === 3" size="mini" v-model="scope1.row.certainHeightWidth"
                        placeholder="请选择" @change="
                          changeDosageByFixtype(scope1.$index, scope.$index)
                        ">
                        <el-option v-for="item in fixType" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div v-else></div>
                  </template>
                </el-table-column>
                <el-table-column label="用量" width="70" header-align="center" align="center">
                  <template slot-scope="scope1">
                    <span v-if="tableStatus === 3">
                      {{ scope1.row.dosage | dosageFilter }}
                      {{ scope1.row.dosage === "" ? "" : scope1.row.unit }}
                    </span>
                    <span v-else-if="customerType === '110'">
                      <el-input v-if="scope1.row.itemType != 'lt'" style="width: 70%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 2)"
                        v-model="scope1.row.dosage">
                      </el-input>
                      <el-input v-else style="width: 70%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"
                        v-model="scope1.row.dosage">
                      </el-input>
                      {{ scope1.row.dosage === "" ? "" : scope1.row.unit }}
                    </span>
                    <span v-else-if="scope1.row.itemType === 'lspb'">--</span>
                    <span v-else-if="scope1.row.modifyFlag === 'Y'">
                      <el-input style="width: 70%;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                                .replace('.', '$#$').replace(/\./g, '')
                                .replace('$#$', '.')
                                .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 2)"
                        v-model="scope1.row.dosage">
                      </el-input>
                      {{ scope1.row.dosage === "" ? "" : scope1.row.unit }}
                    </span>
                    <span v-else>
                      {{ scope1.row.dosage | dosageFilter }}
                      {{ scope1.row.dosage === "" ? "" : scope1.row.unit }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="制造说明" width="100" header-align="center" align="center">
                  <template slot-scope="scope1">
                    <div v-if="tableStatus === 3">
                      {{ scope1.row.manufacturingInstructions }}
                    </div>
                    <div v-else-if="scope1.row.productType === 'XHB'"></div>
                    <div v-else-if="scope1.row.itemType === 'lt'">
                      <el-select size="mini" v-model="scope1.row.manufacturingInstructions" placeholder="--未选--">
                        <el-option v-for="item in part0" :key="item.value" :label="item.value" :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div v-else-if="scope1.row.itemType === 'lspb'">
                      <el-select size="mini" v-model="scope1.row.manufacturingInstructions" placeholder="--未选--">
                        <el-option v-for="item in part3" :key="item.value" :label="item.value" :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div v-else-if="scope1.row.productType === 'ML'">
                      <el-select size="mini" v-model="scope1.row.manufacturingInstructions" placeholder="--未选--">
                        <el-option v-for="item in part1" :key="item.value" :label="item.value" :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="说明" header-align="center" width="80">
                  <template slot-scope="scope1">
                    <span style="color:red;">
                      {{ scope1.row.illustrate }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="备注" header-align="center">
                  <template slot-scope="scope1">
                    <el-input :autosize="{ maxRows: 6 }" :disabled="tableStatus === 3" type="textarea"
                      v-model="scope1.row.note" clearable>
                    </el-input>
                    {{ getRemark(scope1.row, scope.$index) }}
                  </template>
                </el-table-column>
                <el-table-column label="兰居意见" header-align="center" v-if="tableStatus !== 0">
                  <template slot-scope="scope1">
                    <el-input v-if="tableStatus === 1" type="textarea" :autosize="{ maxRows: 6 }"
                      v-model="scope1.row.suggestion" clearable>
                    </el-input>
                    <el-input v-else-if="tableStatus === 2 || tableStatus === 3" size="mini" disabled type="textarea"
                      :autosize="{ maxRows: 6 }" v-model="scope1.row.suggestion" clearable>
                    </el-input>
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: center;" v-if="tableStatus === 1">
                <el-input resize="none" type="textarea" :rows="3" :placeholder="
                    '请输入第' + scope.row.LINE_NO + '副窗帘审核意见'
                  " v-model="scope.row.LJ_SUGGESTION">
                </el-input>
              </div>
            </div>
            <el-dialog width="65%" :append-to-body="true" :visible.sync="dialogTableVisible"
              :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
              <div slot="title">
                <b>{{ dialogTitle }}</b>
              </div>
              <div v-if="items.length !== 0">
                <el-input clearable size="small" class="ml10 mb10" v-if="
                    allCurtaindata[chooseRowIndex][chooseIndex].productType !==
                      'GY'
                  " placeholder="输入商品型号查找" style="width:25%; min-width:220px;" v-model.trim="searchKey"
                  @clear="getAllItemNoData(1)" @keyup.enter.native="getSingleItemNoData(1)">
                  <div id="searchBtn" slot="append" style="cursor:pointer;" @click="getSingleItemNoData(1)">
                    搜索
                  </div>
                </el-input>
                <br />
                <el-radio border size="small" class="mt10 ml10" v-for="item in items" :value="item.itemNo"
                  :key="item.itemNo" v-model="itemNo" :label="item.itemNo">
                  <span v-if="chooseType === 'LCB' || chooseType === 'GY'">
                    {{ item.itemNo + " " + item.note }}
                  </span>
                  <span v-else>{{ item.itemNo }}</span>
                </el-radio>
                <el-pagination v-if="
                    allCurtaindata[chooseRowIndex][chooseIndex].productType !==
                      'GY'
                  " class="tc mt10" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                  :current-page.sync="currentPage" :page-size="pageSize" layout="prev, pager, next, jumper"
                  :total="totalNumber">
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
          </template>
        </el-table-column>
        <el-table-column align="center" prop="LINE_NO" label="序号" width="50"></el-table-column>
        <el-table-column align="center" prop="ITEM_NO" label="型号" width="100"></el-table-column>
        <el-table-column align="center" prop="BRAND_NAME" label="品牌"></el-table-column>
        <el-table-column align="center" prop="NOTE" label="类型" width="100"></el-table-column>
        <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="120"></el-table-column>
        <el-table-column align="center" prop="QTY_REQUIRED" label="数量" width="90"></el-table-column>
        <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
        <el-table-column label="总价" align="center" width="110">
          <template slot-scope="scope">
            <span>{{
                    (scope.row.UNIT_PRICE * scope.row.QTY_REQUIRED)
                      | dosageFilter
                  }}</span>
            <span v-if="allTotal(scope.$index) != scope.row.UNIT_PRICE" style="color:red;">({{allTotal(scope.$index) | dosageFilter}})</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
      </el-table>
      <div style="float:right;margin-top:20px;height:80px;">
        <el-button @click="LanjuChange()" size="medium" type="danger">兰居修改</el-button>
        <el-button size="medium" type="warning" @click="_back()">退回修改</el-button>
        <el-button @click="_pass()" size="medium" type="success">通过审核</el-button>
      </div>
      <div style="padding:10px;">
        <span class="timeLeft">
          创建：
          <span class="timeRight">{{ ruleForm.DATE_CRE }}</span>
        </span>
        <span v-if="ruleForm.WEB_TJ_TIME" class="timeLeft">
          提交：
          <span class="timeRight">{{ ruleForm.WEB_TJ_TIME }}</span>
        </span>
        <span class="timeLeft">
          更新：
          <span class="timeRight">{{ ruleForm.DATE_UPDATE }}</span>
        </span>
        <br />
        <span v-if="ruleForm.DATE_ACCEPT" class="timeLeft">
          接收：
          <span class="timeRight">{{ ruleForm.DATE_ACCEPT }}</span>
        </span>
        <span v-if="ruleForm.DATE_DEAL" class="timeLeft">
          处理：
          <span class="timeRight">{{ ruleForm.DATE_DEAL | datatrans }}</span>
        </span>
        <span v-if="ruleForm.USER_NO" class="timeLeft">
          处理人：
          <span class="timeRight">{{ ruleForm.USER_NO }}</span>
        </span>
      </div>
      <el-divider></el-divider>
      <div style="margin-top:0px;">
        <!-- <span style="margin-left:10px;color:red;"
          >订单修改说明：当修改数量不超过200卷时，双方可通过电话在原订单上进行修改，当修改数量超过200卷时，乙方应向甲方提供书面修改说明。</span
        >
        <br /> -->
        <span style="margin-left:10px;color:red;">法律效力：本订单是双方合作协议不可分割的一部分，是乙方向甲方订货的凭证，具法力效力。</span>
        <el-divider></el-divider>
      </div>
      <div v-if="operationRecords.length > 0" style="width:800px;margin-bottom:20px;">
        <h1 style="margin-left:10px;">处理记录：</h1>
        <el-steps direction="vertical" :active="operationRecords.length" style="margin-top:10px;margin-left:20px;">
          <el-step v-for="item in operationRecords" :key="item.value" style="margin-top:1px;">
            <template slot="title">
              <div v-html="item.OPERATION_NOTE"></div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-card>
  </el-card>
</template>

<script>
import Axios from "axios";
import {
  getOrderlist,
  passExamine,
  orderDetail,
  defeatChange
} from "@/api/orderList";
import {
  getCurtainDetailMsg,
  getGY,
  changeDosageByNo,
  addCurtainToCar,
  changeItem,
  changeItemBlur,
  updateCurtain,
  deleteTheGroup
} from "@/api/curtain";
import { GetDosageByNo } from "@/api/itemInfoASP";
import {
  updateCurtainOrder,
  getOperationRecord,
  getCustomerInfo
} from "@/api/orderListASP";
import { mapMutations, mapActions } from "vuex";
import { mapState } from "vuex";
import Cookies from "js-cookie";
import DetailCurtainTable from "../detail/detailCurtainTable";
export default {
  name: "examineDatail",
  data() {
    return {
      isModified: "",
      deleteIds: [],
      BENarray: "",
      ljsuggestion: "",
      allCurtains: [], //存入数据库的数据
      headerData: {},
      curtainData: "",
      orderNumber: "",
      renderArray: [],
      operationRecords: [],
      tableIndex: "",
      cyLineNo: 0,
      passORback: false,
      passORnot: true,
      detailVisible: false,
      ctmOrderDetails: [],
      STATUS_ID: "",
      //advanceVisible:false,
      //advance:'',
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: []
      },
      expands: [],
      tableStatus: 1,
      spanArr0: [],
      spanArr1: [],
      spanArr2: [],
      customerType: Cookies.get("customerType"),
      cus_customerType: "",
      chooseBig: [],
      chooseSamll: [],
      chooseIndex: -1,
      chooseRowIndex: -1,
      dialogTableVisible: false,
      dialogTitle: "", //弹出层标题
      searchKey: "", //搜索的关键词
      items: [], //可供选择的全部编码
      currentPage: 1, //当前的页数
      pageSize: 30, //每页的个数
      totalNumber: 0, //全部编码的数量
      chooseType: "", //选中的产品类型
      itemNo: "", //选中的编码
      allCurtaindata: [], //表中的窗帘数据
      compareData: [], //对比数据
      oldData: [], //保留最原始数据
      fixType: [
        {
          value: 0,
          label: "定高"
        },
        {
          value: 1,
          label: "定宽"
        }
      ],
      //根据编号查询制造说明
      partpart: [],
      //帘头制造说明
      part0: [
        { value: "么术贴正车" },
        { value: "么术贴反车" },
        { value: "穿/挂杆款" },
        { value: "特殊见备注" }
      ],
      //帘身、纱制造说明
      part1: [{ value: "对开" },  { value: "左单开" }, { value: "右单开" }, { value: "特殊开备注" }],
      //帘身配布制造说明
      part3: [
        { value: "一个褶" },
        { value: "一个半褶" },
        { value: "二个褶" },
        { value: "二个半褶" },
        { value: "三个褶" },
        { value: "三个半褶" }
      ],
      //配件编码
      part2: [],
      suggestionLJ: []
    };
  },
  components: {
    DetailCurtainTable
  },
  created: function() {
    this.orderNumber = Cookies.get("ORDER_NO");
    this.getDetail();
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    }
  },
  methods: {
    allTotal(index) {
      let totalMoney = 0;
      var _data = JSON.parse(JSON.stringify(this.allCurtaindata));
      if (_data.length > 0) {
        for (var i = 0; i < _data.length; i++) {
          for (let j = _data[i].length - 1; j >= 0; j--) {
            _data[i][j].itemId = _data[i][j].item.itemNo;
            if (
              !_data[i][j].choose ||
              _data[i][j].item.itemNo === null ||
              _data[i][j].item.itemNo === ""
            ) {
              _data[i].splice(j, 1);
            }
          }
        }
      }
      for (var i = 0; i < _data[index].length; i++) {
        totalMoney += (_data[index][i].price.mul(_data[index][i].dosage))
      }
      return totalMoney;
    },
    getRowKeys(row) {
      return row.LINE_NO;
    },
    //关闭页面
    closeTheDialog(msg) {
      this.detailVisible = msg;
    },
    //获取修改后的表格数据
    getFinalData(msg, passFlag) {
      if (msg != null && msg != 1) {
        if (passFlag != null && passFlag == 1) this.saveChange(1);
        else this.saveChange(0);
      } else if (msg == 1) {
        this.saveChange(1);
        return;
      }
      let innerLine = msg[0].lineNo;
      this.allCurtains.push(msg);
      //强制换掉这个傻逼数据
      for (let i = 0; i < msg.length; i++) {
        msg[i].itemId = msg[i].item.itemNo;
      }
      for (let a = 0; a < this.allCurtains.length - 1; a++) {
        if (this.allCurtains[a][0].lineNo == innerLine) {
          this.allCurtains.splice(a, 1);
        }
      }
    },
    //获取要删除的配件id
    getDeleteArr(msg) {
      for (var i = 0; i < msg.length; i++) {
        this.deleteIds.push(msg[i]);
      }
    },
    getSuggest(val) {
      let transData = {};
      transData.lineNo = this.cyLineNo;
      transData.orderNo = this.orderNumber;
      transData.ljSuggestion = val;
      if (this.ctmOrderDetails.length == 0) {
        this.ctmOrderDetails.push(transData);
      } else {
        var isContainIndex = this.ctmOrderDetails.findIndex(
          item => item.lineNo == this.cyLineNo
        );
        if (isContainIndex != -1) {
          this.ctmOrderDetails[isContainIndex] = transData;
        } else {
          this.ctmOrderDetails.push(transData);
        }
      }
    },
    //渲染
    Render() {
      this.$set(this.ruleForm.ORDERBODY, this.tableIndex, this.renderArray);
    },
    //保存修改
    saveChange(opreate) {
      this.renderArray = this.ruleForm.ORDERBODY[this.tableIndex];
      if (opreate == 0) {
        this.renderArray.checkStatus = "已修改";
        this.passORback = true;
      } else if (opreate == 1) {
        this.renderArray.checkStatus = "已通过";
      }
      this.Render();
      this.listenStatus();
      this.detailVisible = false;
    },
    openDialog(tab, index) {
      this.detailVisible = true;
      if (tab.checkStatus == "已修改") {
        this.isModified = 1;
      } else {
        this.isModified = 0;
      }
      //this.ljsuggestion='';
      this.ljsuggestion = tab.LJ_SUGGESTION; // 应该可以了吧，不行就换回去
      this.tableIndex = index;
      this.cyLineNo = index + 1;
      this.STATUS_ID = tab.STATUS_ID;
      //拿到保存的建议
      for (let i = 0; i < this.ctmOrderDetails.length; i++) {
        if (this.ctmOrderDetails[i].lineNo == this.cyLineNo) {
          this.ljsuggestion = this.ctmOrderDetails[i].ljSuggestion;
        }
      }

      //强制塞数据
      for (let i = 0; i < tab.curtains.length; i++) {
        tab.curtains[i].choose = true;
        //tab.curtains[i].suggestion='';
        tab.curtains[i].productType = tab.curtains[i].item.productType;
        tab.curtains[i].itemType = tab.curtains[i].curtainPartName;
        if (tab.curtains[i].unit === "°ü") {
          tab.curtains[i].unit = "包";
        }
        tab.curtains[i].dosage = Math.round(tab.curtains[i].dosage.mul(100)) / 100;
      }
      //拿到保存的数据
      this.curtainData = tab.curtains;
      for (let i = 0; i < this.allCurtains.length; i++) {
        if (this.cyLineNo == this.allCurtains[i][0].lineNo) {
          this.curtainData = this.allCurtains[i];
        }
      }
      this.headerData.quantity = tab.QTY_REQUIRED;
      this.headerData.highJia = tab.CURTAIN_HEIGHT2;
      this.headerData.productGroupType = ""; //
      this.headerData.price = tab.all_cost;
      if (tab.CURTAIN_WBH_SIZE == -1) {
        this.headerData.outsourcingBoxExist = 0; //判断
      } else {
        this.headerData.outsourcingBoxExist = 1; //判断
      }
      this.headerData.outsourcingBoxWidth = tab.CURTAIN_WBH_SIZE;
      this.headerData.modelNumber = tab.ITEM_NO;
      this.headerData.location = tab.CURTAIN_ROOM_NAME
        ? tab.CURTAIN_ROOM_NAME
        : "无"; //'无';
      this.headerData.height = tab.CURTAIN_HEIGHT;
      this.headerData.width = tab.CURTAIN_WIDTH;
      this.headerData.drape = tab.CURTAIN_SIZE_TIMES;
      this.headerData.checked = "";
      this.headerData.cartItemId = "";
      this.headerData.activityGroupType = ""; //
      this.headerData.activity = tab.PROMOTION_TYPE;
    },
    getCustomer() {
      var data = {
        cid: this.ruleForm.CUSTOMER_CODE,
        companyId: this.ruleForm.CUSTOMER_CODE
      };
      getCustomerInfo(data).then(res => {
        this.cus_customerType = res.data.CUSTOMER_TYPE;
      });
    },
    getDetail() {
      let url = "/order/getOrderContent.do";
      let data = {
        cid: Cookies.get("cid"),
        order_no: Cookies.get("ORDER_NO")
      };
      orderDetail(url, data).then(res => {
        this.ruleForm = res.data.data[0];
        this.getCustomer();
        for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
          this.ruleForm.ORDERBODY[i].checkStatus = "未修改";
          this.expands.push(this.ruleForm.ORDERBODY[i].LINE_NO);
        }
        this.dealCurtainData();
        var recordData = {
          orderNo: this.orderNumber
        };
        getOperationRecord(recordData, { loading: false }).then(res => {
          this.operationRecords = res.data;
        });
      });
    },
    dealCurtainData() {
      //配件包
      this.part2 = [];
      let _obj = {
        limit: 999,
        page: 1,
        itemNO: "PJB"
      };
      changeItem(_obj)
        .then(res => {
          let _arr = [];
          res.data.forEach(item => {
            _arr.push({
              label: `${item.itemNo}:${item.note}`,
              value: item.itemNo,
              unit: item.unit === "°ü" ? "包" : item.unit,
              note: item.note,
              item: item
            });
          });
          _arr.sort(function(a, b) {
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
        .catch(err => {
          this.part2 = [];
        });
      this.ruleForm.headerData = [];
      //循环处理多个窗帘
      for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var data = this.ruleForm.ORDERBODY[i];
        let smallChoose = [];
        for (let cur = 0; cur < data.curtains.length; cur++) {
          this.$set(data.curtains[cur],'choose', true);
          smallChoose.push(true);
          data.curtains[cur].productType = data.curtains[cur].item.productType;
          data.curtains[cur].itemType = data.curtains[cur].curtainPartName;
          if (data.curtains[cur].unit === "°ü") {
            data.curtains[cur].unit = "包";
          }
          data.curtains[cur].dosage =
            Math.round(data.curtains[cur].dosage.mul(100)) / 100;
        }
        data.curtains.sort(function(a, b) {
          let rule = ["lt", "ls", "lspb", "sha", "pjb"];
          return rule.indexOf(a.itemType) - rule.indexOf(b.itemType);
        });
        if (data.LJ_SUGGESTION == " ") data.LJ_SUGGESTION = "";
        //合并单元格数据
        this.getSpanArr(data.curtains);
        //表头数据
        var headerDataTemp = [];
        headerDataTemp.quantity = data.QTY_REQUIRED;
        headerDataTemp.highJia = data.CURTAIN_HEIGHT2;
        headerDataTemp.productGroupType = ""; //
        headerDataTemp.price = data.all_cost;
        if (data.CURTAIN_WBH_SIZE == -1) {
          headerDataTemp.outsourcingBoxExist = 0; //判断
        } else {
          headerDataTemp.outsourcingBoxExist = 1; //判断
        }
        headerDataTemp.outsourcingBoxWidth = data.CURTAIN_WBH_SIZE;
        headerDataTemp.modelNumber = data.ITEM_NO;
        headerDataTemp.location = data.CURTAIN_ROOM_NAME
          ? data.CURTAIN_ROOM_NAME
          : "无"; //'无';
        headerDataTemp.height = data.CURTAIN_HEIGHT;
        headerDataTemp.width = data.CURTAIN_WIDTH;
        headerDataTemp.drape = data.CURTAIN_SIZE_TIMES;
        headerDataTemp.checked = "";
        headerDataTemp.cartItemId = "";
        headerDataTemp.activityGroupType = ""; //
        headerDataTemp.activity = data.PROMOTION_TYPE;
        this.ruleForm.headerData.push(headerDataTemp);
        //旧数据
        this.allCurtaindata.push(data.curtains);
        this.oldData.push(JSON.parse(JSON.stringify(data.curtains)));
        this.compareData.push(JSON.parse(JSON.stringify(data.curtains)));

        this.chooseBig.push([true, true, true, true, true]);
        this.chooseSamll.push(smallChoose);

        let obj = {
          itemNO: headerDataTemp.modelNumber.toString(),
          width: headerDataTemp.width.toString(),
          height: headerDataTemp.height.toString(),
          WBH: headerDataTemp.outsourcingBoxExist
            ? headerDataTemp.outsourcingBoxWidth.toString()
            : "0",
          multiple: headerDataTemp.drape.toString(),
          location: headerDataTemp.location
        };
        getCurtainDetailMsg(obj, { loading: false }).then(async res => {
          let _data = res.itemList;
          let itemIndex = 0;
          for (var i = 0; i < this.ruleForm.headerData.length; i++) {
            if (
              this.ruleForm.headerData[i].modelNumber ==
              _data[0].itemMLGY.parentItemNo
            ) {
              itemIndex = i;
              break;
            }
          }
          for (
            let index = 0;
            index < this.compareData[itemIndex].length;
            index++
          ) {
            for (let j = 0; j < _data.length; j++) {
              if (
                Number(_data[j].itemMLGY.no) ===
                Number(this.compareData[itemIndex][index].inlineNo)
              ) {
                this.compareData[itemIndex][index].item.itemNo =
                  _data[j].itemNo;
                let _comData = this.compareData[itemIndex][index];
                if (
                  _comData.certainHeightWidth !== null &&
                  _comData.productType === "ML"
                ) {
                  let _itemObj = {
                    itemType: _comData.productType,
                    itemNO: this.allCurtaindata[itemIndex][index].item.itemNo,
                    limit: 1,
                    page: 1
                  };
                  let ress = await changeItemBlur(_itemObj, { loading: false });
                  if (ress.data.length > 0) {
                    this.compareData[itemIndex][index].certainHeightWidth =
                      ress.data[0].fixType === "02" ? 0 : 1;
                  }
                }
                break;
              }
            }
          }
        });
      }
    },
    getSpanArr(msg) {
      let data = msg;
      var span0 = [];
      var span1 = [];
      var pos = 0;
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          span0.push(data.length);
          span1.push(1);
          pos = 0;
        } else {
          span0.push(0);
          // 判断当前元素与上一个元素是否相同
          if (data[i].itemType === data[i - 1].itemType) {
            span1[pos] += 1;
            span1.push(0);
          } else {
            span1.push(1);
            pos = i;
          }
        }
      }
      this.spanArr0.push(span0);
      this.spanArr1.push(span1);
    },
    //通过数组合并行
    cellMerge({ row, column, rowIndex, columnIndex }, index) {
      if (columnIndex === 0) {
        let _row = this.spanArr0[index][rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        };
      }
      if (columnIndex === 1) {
        let _row = this.spanArr1[index][rowIndex];
        let _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
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
            colspan: 2
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
            colspan: 0
          };
        }
      }
    },
    changePJBUnit(index, rowIndex) {
      let _data = this.allCurtaindata[rowIndex][index].item.itemNo;
      this.part2.forEach(item => {
        if (item.value === _data) {
          this.allCurtaindata[rowIndex][index].unit = item.unit;
          this.allCurtaindata[rowIndex][index].curtainItemName = item.note;
          var price = this.getPrice(this.cus_customerType, item.item);
          this.allCurtaindata[rowIndex][index].price = price;
          this.judgeTip(this.allCurtaindata[rowIndex][index], index, rowIndex);
          return;
        }
      });
    },
    //大类和二类的联动
    changeLink(type, index, rowIndex) {
      for (let i = 0; i < this.allCurtaindata[rowIndex].length; i++) {
        if (this.allCurtaindata[rowIndex][i].itemType === type) {
          this.allCurtaindata[rowIndex][i].choose = this.chooseBig[rowIndex][
            index
          ];
          this.chooseSamll[rowIndex][i] = this.chooseBig[rowIndex][index];
        }
      }
    },
    //大类和二类的反向联动
    changeLinkReverse(data, index, rowIndex) {
      this.allCurtaindata[rowIndex][index].choose = this.chooseSamll[rowIndex][
        index
      ];
      let _index;
      let _arr = this.getBigType(data.itemType, rowIndex);
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
        _arr.forEach(item => {
          if (item.deleteFlag !== "Y" || item.choose === true) {
            flag = false;
          }
        });
        if (data.choose || flag) {
          this.chooseBig[rowIndex][_index] = data.choose;
        }
      }
    },
    //获取某个大类的全部数据
    getBigType(type, rowIndex) {
      let arr = [];
      this.allCurtaindata[rowIndex].forEach(item => {
        if (item.itemType === type) {
          arr.push(item);
        }
      });
      return arr;
    },
    resolvePass() {
      //已经修改后，二次确认
      if (this.isModified === 1) {
        this.$confirm("此窗帘已经修改了，依然确认通过吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this.$emit("visible", false);
            this.$emit("finalData", 1);
            this.$emit("suggest", this.suggestionLJ);
          })
          .catch(() => {});
      }
      //非修改
      else {
        //同一过滤
        let _data = JSON.parse(JSON.stringify(this.allCurtaindata));
        var _data_temp = [];
        _data.forEach(item => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          _data_temp.push(JSON.parse(JSON.stringify(item)));
        });
        //把不需要比对的备注和意见拿出来
        _data_temp.forEach(item => {
          item.note = "";
          item.suggestion = "";
        });
        var oldData_temp = [];
        this.oldData.forEach(item => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          oldData_temp.push(JSON.parse(JSON.stringify(item)));
        });
        //把不需要比对的备注和意见拿出来
        oldData_temp.forEach(item => {
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
              type: "info"
            }
          )
            .then(() => {
              this.$emit("visible", false);
              this.$emit("finalData", _data, 1);
              this.$emit("suggest", this.suggestionLJ);
            })
            .catch(() => {});
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
      let _data = JSON.parse(JSON.stringify(this.allCurtaindata));
      let _deleteArr = [];
      for (let i = _data.length - 1; i >= 0; i--) {
        if (
          !_data[i].choose ||
          _data[i].item.itemNo === null ||
          _data[i].item.itemNo === ""
        ) {
          _deleteArr.unshift(_data[i].id);
          _data.splice(i, 1);
        }
      }
      if (_data.length === 0) {
        this.$alert("请至少选择一款配件!", "提示", {
          confirmButtonText: "确定",
          type: "warning"
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
            type: "warning"
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
    getNewItemNo(data, index, rowIndex) {
      this.itemNo = "";
      this.searchKey = "";
      this.items = [];
      this.dialogTableVisible = true;
      this.dialogTitle = `【${this.getProductName(
        data.productType
      )}】类产品列表`;
      this.chooseIndex = index;
      this.chooseRowIndex = rowIndex;
      this.chooseType = data.productType;
      if (data.productType !== "GY") {
        this.getAllItemNoData(1);
      } else {
        this.getTheGY(this.ruleForm.headerData[rowIndex].modelNumber);
      }
    },
    //获取每页的条数
    handleSizeChange(val) {},
    //当前页改变时的操作
    handleCurrentChange(val) {
      if (this.searchKey === "") {
        this.getAllItemNoData(0);
      } else {
        this.getSingleItemNoData(0);
      }
    },
    //获取可修改的全部编码
    getAllItemNoData(status) {
      if (this.searchKey !== "") return;
      //0为默认搜索，1为搜索时首页
      if (status === 1) this.currentPage = 1;
      let obj = {
        itemNO: this.chooseType,
        limit: this.pageSize,
        page: this.currentPage
      };
      changeItem(obj)
        .then(res => {
          this.items = res.data;
          this.totalNumber = res.data[0].total;
        })
        .catch(err => {
          this.items = [];
          this.currentPage = 1;
          this.totalNumber = 0;
        });
    },
    //获取模糊搜索的编码
    getSingleItemNoData(status) {
      //0为默认模糊搜索，1为模糊搜索时首页
      if (this.searchKey === "") return;
      if (status === 1) this.currentPage = 1;
      let obj = {
        itemType: this.chooseType,
        itemNO: this.searchKey.toUpperCase(),
        limit: this.pageSize,
        page: this.currentPage
      };
      changeItemBlur(obj)
        .then(res => {
          this.items = res.data;
          this.totalNumber = res.data[0].total;
        })
        .catch(err => {
          this.items = [];
          this.currentPage = 1;
          this.totalNumber = 0;
        });
    },
    getPrice(type, item) {
      var price = 0;
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
      return price;
    },
    //修改编码--影响用量
    chooseItemNo() {
      if (this.itemNo === "") {
        this.$alert("请选择一个产品", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        });
        return;
      }
      if (this.chooseIndex < 0) {
        this.dialogTableVisible = false;
        return;
      }
      let _productType = this.allCurtaindata[this.chooseRowIndex][
        this.chooseIndex
      ].productType;
      let status = _productType === "ML" ? true : false;
      let status1 = _productType === "GY" ? true : false;
      this.dialogTableVisible = false;
      //修改对应的名称规格
      let data = this.items.find(v => {
        if (v.itemNo === this.itemNo) return v;
      });
      var price = this.getPrice(this.cus_customerType, data);
      this.allCurtaindata[this.chooseRowIndex][
        this.chooseIndex
      ].curtainItemName = data.note;
      this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].specification =
        data.fixGrade / 1000;
      this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].price = price;
      let theFixType;
      if (
        this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].itemType ===
        "lspb"
      ) {
        this.allCurtaindata[this.chooseRowIndex][
          this.chooseIndex
        ].certainHeightWidth = null;
        this.allCurtaindata[this.chooseRowIndex][
          this.chooseIndex
        ].item.itemNo = this.itemNo;
        this.judgeTip(
          this.allCurtaindata[this.chooseRowIndex][this.chooseIndex],
          this.chooseIndex,
          this.chooseRowIndex
        );
        return;
      }
      if (data.fixType === "01") {
        theFixType = 1;
      } else if (data.fixType === "02") {
        theFixType = 0;
      }
      this.allCurtaindata[this.chooseRowIndex][
        this.chooseIndex
      ].certainHeightWidth = theFixType;
      this.compareData[this.chooseRowIndex][
        this.chooseIndex
      ].certainHeightWidth = theFixType;
      let _headerData = this.ruleForm.headerData[this.chooseRowIndex];
      let _outsourcingBoxWidth =
        _headerData.outsourcingBoxExist === 0
          ? "0"
          : _headerData.outsourcingBoxWidth;
      let _fixType =
        this.allCurtaindata[this.chooseRowIndex][this.chooseIndex]
          .certainHeightWidth === 0
          ? "02"
          : "01";
      let obj = {
        width: _headerData.width.toString(),
        height: _headerData.height.toString(),
        WBH:
          _outsourcingBoxWidth === null ? "0" : _outsourcingBoxWidth.toString(),
        multiple: _headerData.drape.toString(),
        parentItemNo: _headerData.modelNumber,
        itemNO: this.itemNo,
        itemType: this.allCurtaindata[this.chooseRowIndex][this.chooseIndex]
          .itemType,
        fixType: _fixType
      };
      if (
        !status1 &&
        this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].itemType !==
          "lspb"
      ) {
        //修改用量
        //changeDosageByNo(obj)
        GetDosageByNo(obj)
          .then(res => {
            if (res.data.length == 0) {
              this.$alert("用量获取失败", "提示", {
                confirmButtonText: "好的",
                type: "warning"
              });
              return;
            }
            let _data = this.allCurtaindata[this.chooseRowIndex][
              this.chooseIndex
            ];
            let keys;
            if (_data.itemType == "lt")
              keys = Math.round(res.data[0].dosage.mul(100)) / 100;
            else keys = Math.round(res.data[0].dosage * 10) / 10;
            //绣花边只需要修改自身，无需修改面料
            if (_data.productType === "XHB") {
              this.allCurtaindata[this.chooseRowIndex][
                this.chooseIndex
              ].dosage = keys;
            }
            //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
            else if (_data.productType === "ML") {
              this.updateDosage(_data.itemType, keys, -1);
            }
            this.allCurtaindata[this.chooseRowIndex][
              this.chooseIndex
            ].item.itemNo = this.itemNo;
            this.judgeTip(
              this.allCurtaindata[this.chooseRowIndex][this.chooseIndex],
              this.chooseIndex,
              this.chooseRowIndex
            );
          })
          .catch(err => {
            console.log(err);
          });
      } else if (status1) {
        this.allCurtaindata[this.chooseRowIndex][
          this.chooseIndex
        ].item.itemNo = this.itemNo;
        this.judgeTip(
          this.allCurtaindata[this.chooseRowIndex][this.chooseIndex],
          this.chooseIndex,
          this.chooseRowIndex
        );
        if (
          this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].item
            .itemNo === "GY-003"
        ) {
          GetDosageByNo(obj).then(res => {
            this.allCurtaindata[this.chooseRowIndex][this.chooseIndex].dosage =
              Math.round(res.data[0].dosage * 10) / 10;
          });
        } else {
          for (
            let i = 0;
            i < this.allCurtaindata[this.chooseRowIndex].length;
            i++
          ) {
            if (
              this.allCurtaindata[this.chooseRowIndex][i].itemType ===
                this.allCurtaindata[this.chooseRowIndex][this.chooseIndex]
                  .itemType &&
              i !== this.chooseIndex
            ) {
              if (
                this.allCurtaindata[this.chooseRowIndex][i].productType === "ML"
              ) {
                this.allCurtaindata[this.chooseRowIndex][
                  this.chooseIndex
                ].dosage = this.allCurtaindata[this.chooseRowIndex][i].dosage;
                break;
              }
            }
          }
        }
      }
    },
    //修改风格
    changeDosageByFixtype(index, rowIndex) {
      let _headerData = this.ruleForm.headerData[rowIndex];
      let _outsourcingBoxWidth =
        _headerData.outsourcingBoxExist === 0
          ? "0"
          : _headerData.outsourcingBoxWidth;
      let _fixType =
        this.allCurtaindata[rowIndex][index].certainHeightWidth === 0
          ? "02"
          : "01";
      let obj = {
        width: _headerData.width.toString(),
        height: _headerData.height.toString(),
        WBH:
          _outsourcingBoxWidth === null ? "0" : _outsourcingBoxWidth.toString(),
        multiple: _headerData.drape.toString(),
        parentItemNo: _headerData.modelNumber,
        itemNO: this.allCurtaindata[rowIndex][index].item.itemNo,
        itemType: this.allCurtaindata[rowIndex][index].itemType,
        fixType: _fixType
      };
      //changeDosageByNo(obj)
      GetDosageByNo(obj, { loading: false })
        .then(res => {
          if (res.data.length == 0) {
            this.$alert("用量获取失败", "提示", {
              confirmButtonText: "好的",
              type: "warning"
            });
            return;
          }
          let _data = this.allCurtaindata[rowIndex][index];
          let keys;
          if (_data.itemType == "lt")
            keys = Math.round(res.data[0].dosage.mul(100)) / 100;
          else keys = Math.round(res.data[0].dosage * 10) / 10;
          //绣花边只需要修改自身，无需修改面料
          if (_data.productType === "XHB") {
            this.allCurtaindata[rowIndex][index].dosage = keys;
          }
          //面料除了修改自身，还需修改所有其他的，除了LCB、XHB之外的所有，工艺继续做进一步判断
          else if (_data.productType === "ML") {
            this.updateDosage(_data.itemType, keys, rowIndex);
          }
          this.judgeTip(this.allCurtaindata[rowIndex][index], index, rowIndex);
        })
        .catch(err => {
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
    updateDosage(itemType, dosage, rowIndex) {
      if (rowIndex > -1) {
        this.chooseRowIndex = rowIndex;
      }
      for (
        let i = 0;
        i < this.allCurtaindata[this.chooseRowIndex].length;
        i++
      ) {
        let pType = this.allCurtaindata[this.chooseRowIndex][i].productType;
        if (
          this.allCurtaindata[this.chooseRowIndex][i].itemType === itemType &&
          pType !== "LCB" &&
          pType !== "XHB"
        ) {
          if (
            this.allCurtaindata[this.chooseRowIndex][i].item.itemNo !== "GY-003"
          ) {
            this.allCurtaindata[this.chooseRowIndex][i].dosage = dosage;
          }
        }
      }
    },
    //获取备注文字
    getRemark(data, rowIndex) {
      if (data.certainHeightWidth === 0) {
        if (
          data.specification <
            this.ruleForm.ORDERBODY[rowIndex].CURTAIN_HEIGHT &&
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
        itemNO: itemNo
      };
      this.currentPage = 1;
      getGY(data)
        .then(res => {
          // res.itemList.sort(function(a, b) {
          //   return a.itemNO > b.itemNO ? 1 : -1;
          // });
          this.items = res.itemList;
          this.totalNumber = res.itemList.length;
        })
        .catch(err => {
          this.items = [];
          this.totalNumber = 0;
        });
    },
    //动态判断制造说明
    judgeTip(data, index, rowIndex) {
      let status = -1;
      if (
        data.certainHeightWidth === 0 &&
        this.compareData[rowIndex][index].certainHeightWidth === 1
      ) {
        status = 1;
      }
      if (
        data.certainHeightWidth === 1 &&
        this.compareData[rowIndex][index].certainHeightWidth === 0
      ) {
        status = 2;
      }
      if (data.item.itemNo !== this.compareData[rowIndex][index].item.itemNo) {
        if (status === 1) status = 4;
        else if (status === 2) status = 5;
        else status = 3;
      }
      if (
        data.itemType === "pjb" ||
        data.productType === "LCB" ||
        data.productType == "GY"
      ) {
        status = -1;
      }
      switch (status) {
        case 1:
          this.allCurtaindata[rowIndex][index].illustrate = "修改为定高";
          break;
        case 2:
          this.allCurtaindata[rowIndex][index].illustrate = "修改为定宽";
          break;
        case 3:
          this.allCurtaindata[rowIndex][index].illustrate = "非标配";
          break;
        case 4:
          this.allCurtaindata[rowIndex][index].illustrate =
            "修改为定高，非标配";
          break;
        case 5:
          this.allCurtaindata[rowIndex][index].illustrate =
            "修改为定宽，非标配";
          break;
        default:
          this.allCurtaindata[rowIndex][index].illustrate = "";
      }
    },
    bigToSmall: function(data) {
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
    getLJSuggest() {
      this.ctmOrderDetails = [];
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var data = this.ruleForm.ORDERBODY[i];
        let transData = {};
        transData.lineNo = data.LINE_NO;
        transData.orderNo = data.ORDER_NO;
        transData.ljSuggestion = data.LJ_SUGGESTION;
        this.ctmOrderDetails.push(transData);
      }
    },
    getCurtainData() {
      this.allCurtains = [];
      this.deleteIds = [];
      let _data = JSON.parse(JSON.stringify(this.allCurtaindata));
      for (var i = 0; i < _data.length; i++) {
        for (let j = _data[i].length - 1; j >= 0; j--) {
          _data[i][j].itemId = _data[i][j].item.itemNo;
          if (
            !_data[i][j].choose ||
            _data[i][j].item.itemNo === null ||
            _data[i][j].item.itemNo === ""
          ) {
            this.deleteIds.unshift(_data[i][j].id);
            _data[i].splice(j, 1);
          }
        }
      }
      this.allCurtains = _data;
    },
    contrastData() {
      let _data = JSON.parse(JSON.stringify(this.allCurtains)); //修改后数据
      let _old_data = JSON.parse(JSON.stringify(this.oldData)); //原始数据
      var _data_temp = [];
      _data.forEach(oneItem => {
        oneItem.forEach(item => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          if (item.illustrate === null) item.illustrate = "";
          _data_temp.push(JSON.parse(JSON.stringify(item)));
        });
      });
      //把不需要比对的备注和意见拿出来
      _data_temp.forEach(item => {
        item.note = "";
        item.suggestion = "";
      });
      var oldData_temp = [];
      _old_data.forEach(oneItem => {
        oneItem.forEach(item => {
          item.dosage = Number(item.dosage);
          if (item.curtainItemName === null || item.curtainItemName === "") {
            item.curtainItemName = this.getTypeName(item.itemType);
          }
          if (item.note === null) item.note = "";
          if (item.suggestion === null) item.suggestion = "";
          if (item.illustrate === null) item.illustrate = "";
          oldData_temp.push(JSON.parse(JSON.stringify(item)));
        });
      });
      //把不需要比对的备注和意见拿出来
      oldData_temp.forEach(item => {
        item.note = "";
        item.suggestion = "";
      });
      return JSON.stringify(oldData_temp) == JSON.stringify(_data_temp);
    },
    //兰居修改
    LanjuChange() {
      this.getLJSuggest();
      this.getCurtainData();
      for (var i = 0; i < this.allCurtains.length; i++) {
        if (this.allCurtains[i].length == 0) {
          this.$alert("请至少选择一款配件!", "提示", {
            confirmButtonText: "好的",
            type: "warning"
          });
          return;
        } else {
          for (let j = 0; j < this.allCurtains[i].length; j++) {
            let item = this.allCurtains[i][j];
            if (
              (item.manufacturingInstructions === "特殊见备注" ||
                item.manufacturingInstructions === "特殊开备注") &&
              (!item.note || item.note === "")
            ) {
              this.$alert(`请填写特殊开的备注`, "提示", {
                confirmButtonText: "确定",
                type: "warning"
              });
              return;
            }
          }
        }
      }
      let url = "/order/updateCurtainOrder.do";
      let data = {
        cid: Cookies.get("cid"),
        orderNo: this.orderNumber,
        curtainStatusId: "2",
        allCurtains: this.allCurtains,
        ctmOrderDetails: this.ctmOrderDetails,
        deleteIds: this.deleteIds
      };
      if (this.contrastData()) {
        this.$confirm("所有窗帘未修改，依然兰居修改吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this.LanjuChangeANYS(data);
          })
          .catch(() => {
            return;
          });
      } else {
        this.$confirm("确认兰居修改吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this.LanjuChangeANYS(data);
          })
          .catch(() => {
            return;
          });
      }
    },
    LanjuChangeANYS(data) {
      //defeatChange(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,已将该订单退回给用户进行确认", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.closeToTab({
              oldUrl: "order/examineDetailNew",
              newUrl: "order/examine"
            });
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    //退回客户修改
    _back() {
      this.getLJSuggest();
      this.getCurtainData();
      let url = "/order/updateCurtainOrder.do";
      let data = {
        cid: Cookies.get("cid"),
        orderNo: this.orderNumber,
        curtainStatusId: "1",
        allCurtains: [],
        ctmOrderDetails: this.ctmOrderDetails
      };
      for (let j = 0; j < this.allCurtains.length; j++) {
        let array = new Array();
        for (let i = 0; i < this.allCurtains[j].length; i++) {
          array[i] = new Object();
          array[i].suggestion = this.allCurtains[j][i].suggestion;
          array[i].lineNo = this.allCurtains[j][i].lineNo;
          array[i].orderItemNumber = this.allCurtains[j][i].orderItemNumber;
          array[i].orderNo = this.orderNumber;
        }
        data.allCurtains.push(array);
      }
      if (!this.contrastData()) {
        this.$confirm("有窗帘已经修改了，依然确认退回吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this._backANSCYC(data);
          })
          .catch(() => {
            return;
          });
      } else {
        this.$confirm("确认退回吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this._backANSCYC(data);
          })
          .catch(() => {
            return;
          });
      }
    },
    _backANSCYC(data) {
      //defeatChange(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,已将该订单退回给用户进行确认", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            this.closeToTab({
              oldUrl: "order/examineDetailNew",
              newUrl: "order/examine"
            });
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    //审核通过
    _pass() {
      this.getLJSuggest();
      this.getCurtainData();
      var url = "/order/updateCurOrderStatus.do";
      var data = {
        cid: Cookies.get("cid"),
        orderNo: Cookies.get("ORDER_NO"),
        curtainStatusId: "4",
        allCurtains: [],
        ctmOrderDetails: this.ctmOrderDetails
      };
      for (let j = 0; j < this.allCurtains.length; j++) {
        let array = new Array();
        for (let i = 0; i < this.allCurtains[j].length; i++) {
          array[i] = new Object();
          array[i].note = this.allCurtains[j][i].note;
          array[i].suggestion = this.allCurtains[j][i].suggestion;
          array[i].lineNo = this.allCurtains[j][i].lineNo;
          array[i].orderItemNumber = this.allCurtains[j][i].orderItemNumber;
          array[i].orderNo = this.orderNumber;
        }
        data.allCurtains.push(array);
      }
      if (!this.contrastData()) {
        this.$confirm("有窗帘已经修改了，依然确认通过吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this._passANSYC(data);
          })
          .catch(() => {
            return;
          });
      } else {
        this.$confirm("确认通过吗？", "提示", {
          confirmButtonText: "确定",
          type: "warning"
        })
          .then(() => {
            this._passANSYC(data);
          })
          .catch(() => {
            return;
          });
      }
    },
    _passANSYC(data) {
      //passExamine(url, data).then(res => {
      updateCurtainOrder(data)
        .then(res => {
          if (res.code == 0) {
            this.$alert("操作成功,该订单已通过审核", "提示", {
              confirmButtonText: "确定",
              type: "success"
            });
            //this.addTab('order/examine');
            this.closeToTab({
              oldUrl: "order/examineDetailNew",
              newUrl: "order/examine"
            });
            //跳转
          } else {
            this.$alert("操作失败，请稍后重试", "提示", {
              confirmButtonText: "确定",
              type: "warning"
            });
          }
        })
        .catch(res => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning"
          });
          console.log(res);
        });
    },
    //监听状态
    listenStatus() {
      let count = 0;
      for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        if (this.ruleForm.ORDERBODY[i].checkStatus == "已通过") {
          count++;
        }
      }
      if (count == this.ruleForm.ORDERBODY.length) {
        this.passORnot = false;
        this.passORback = false;
      } else {
        this.passORnot = true;
        this.passORback = true;
      }
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      return "success-row";
    },
    ...mapMutations("navTabs", ["addTab"]),
    ...mapActions("navTabs", ["closeTab", "closeToTab"])
  }
};
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.childCard {
  width: 90%;
  height: 200px;
  float: left;
}
.tableCard {
  float: left;
  width: 100%;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.zoomRight {
  font-weight: 400;
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
  margin-right: 30px;
  font-weight: bold;
}
.zoomLeft {
  font-size: 15px;
  display: inline-block;
  margin-right: 10px;
}
.timeLeft {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
}
.timeRight {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
  margin-right: 20px;
  font-weight: bold;
}
.messageBox > div {
  padding: 5px 0;
}
.messageInput {
  border: 1px solid #c3c3c3;
  margin-right: 3px;
  padding: 0 2px;
  min-width: 40px;
  border-radius: 4px;
  color: gray;
  display: inline-block;
  line-height: 20px;
}
</style>
<style>
.el-table .success-row {
  background: #f0f9eb;
}
.tableCard .el-icon-arrow-right:before {
  content: "";
}
.curtainTable .el-table td,
.curtainTable .el-table th {
  padding: 0 !important;
}
.curtainTable .el-table .cell {
  padding: 0 5px;
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