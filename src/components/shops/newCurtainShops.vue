<template>
  <el-card shadow="never" style="min-height:500px;">
    <div>
      <el-input clearable v-model.trim="searchKey" @clear="searchCurtain" @keyup.enter.native="searchCurtain"
        placeholder="请输入帘款查找窗帘" style="width:300px;">
        <el-button @click="searchCurtain" slot="append" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>
    <div class="curtain-contain" v-if="curtainHeadData && curtainHeadData.ITEM_NO">
      <!-- 帘款 -->
      <div class="curtain-parent-item">
        <span>帘款：{{curtainHeadData.ITEM_NO}}</span>
      </div>
      <!-- 帘款参数 -->
      <div class="curtain-params">
        <span>成品宽：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.width" @input="changeHeadWidth" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <span style="margin-left:20px;">成品高：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.height" @input="changeHeadHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <span style="margin-left:20px;">活动：</span>
        <el-select size="mini" style="width:220px" :disabled="activityOptions.length == 1"
          v-model="curtainHeadData.activityId" :placeholder="activityOptions.length == 1? '无可选活动': '请选择活动'">
          <el-option v-for="item in activityOptions" :key="item.P_ID"
            :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
          </el-option>
        </el-select>
        <span style="margin-left:20px;">位置：</span>
        <el-input style="width:100px;" v-model="curtainHeadData.location" size="mini"></el-input>
      </div>
      <!-- 窗帘部件 -->
      <div class="curtain-list">
        <el-table :data="curtainData" class="curtain-table" border size="medium" :span-method="cellMerge">
          <el-table-column label="预览" width="130" align="center">
            <template slot-scope="scope">
              <!-- 显示图片预览 -->
              <div v-if="scope.$index == 0">
                <img class="curtain-preview" :src="previewUrl" @error="showDefaultImg" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
            <template slot-scope="scope">
              <!-- 树缩进 -->
              <span v-if="scope.row.curtain_level > 0">
                <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
              </span>
              <span :class="{'delete-cls': !scope.row.curtain_choose}"
                :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
            <template slot-scope="scope">
              <!-- 是否可替换 -->
              <a v-if="scope.row.NCT_CHANGE == 1 && scope.row.NCM_CHANGE == 1" class="a-link"
                :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</a>
              <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
              <!-- 是否可删/是否默认勾选 -->
              <el-checkbox v-if="scope.row.NCT_DELETE > 0 && scope.row.NCM_DELETE > 0"
                v-model="scope.row.curtain_choose"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
          </el-table-column>
          <el-table-column label="制造说明" width="280" header-align="center">
            <template slot-scope="scope">
              <!-- N个配置项逐个检测 -->
              <!-- 宽，高 -->
              <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                <template v-if="scope.row.WIDTH_ENABLE == 1">
                  <span>【宽】:{{ scope.row.curtain_width }}m</span>
                </template>
                <template v-if="scope.row.WIDTH_ENABLE == 2">
                  <span>【宽】: <el-input v-model="scope.row.curtain_width" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.HEIGHT_ENABLE == 1">
                  <span>【高】:{{ scope.row.curtain_height }}m</span>
                </template>
                <template v-if="scope.row.HEIGHT_ENABLE == 2">
                  <span>【高】: <el-input v-model="scope.row.curtain_height" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
              </div>
              <!-- 左右圆角 -->
              <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                <template v-if="scope.row.LEFT_ENABLE == 1">
                  <span>【左转角】:{{ scope.row.curtain_left_filet }}m</span>
                </template>
                <template v-if="scope.row.LEFT_ENABLE == 2">
                  <span>【左转角】: <el-input v-model="scope.row.curtain_left_filet" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.RIGHT_ENABLE == 1">
                  <span>【右转角】:{{ scope.row.curtain_right_filet }}m</span>
                </template>
                <template v-if="scope.row.RIGHT_ENABLE == 2">
                  <span>【右转角】: <el-input v-model="scope.row.curtain_right_filet" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
              </div>
              <!-- 么术贴 -->
              <div class="manufacturing-ct" v-if="scope.row.TIE_ENABLE > 0">
                <template v-if="scope.row.TIE_ENABLE == 1">
                  <span>【么术贴】:{{ scope.row.NCM_MESUTIE | meshutie_filter}}</span>
                </template>
                <template v-if="scope.row.TIE_ENABLE == 2">
                  <el-dropdown trigger="click">
                    <span>【么术贴】:<a
                        class="a-userset">{{ scope.row.NCM_MESUTIE? scope.row.NCM_MESUTIE : '请选择' | meshutie_filter}}</a></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.NCM_MESUTIE = 'ZC'">正车</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.NCM_MESUTIE = 'FC'">反车</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 打开方式 -->
              <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                <template v-if="scope.row.KAIKOU_ENABLE == 1">
                  <span>【打开方式】:{{ scope.row.NCM_KAIKOU | kaikou_filter }}</span>
                </template>
                <template v-if="scope.row.KAIKOU_ENABLE == 2">
                  <el-dropdown trigger="click">
                    <span>【打开方式】:<a
                        class="a-userset">{{ scope.row.NCM_KAIKOU? scope.row.NCM_KAIKOU : '请选择' | kaikou_filter}}</a></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'TK'">对开</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'DK'">单开</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'SK'">特殊开</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 工艺方式 -->
              <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                <template v-if="scope.row.OPERATION_ENABLE == 1">
                  <span>【工艺方式】:{{ scope.row.NCM_OPERATION | operation_filter }}</span>
                </template>
                <template v-if="scope.row.OPERATION_ENABLE == 2">
                  <el-dropdown trigger="click">
                    <span>【工艺方式】:<a
                        class="a-userset">{{ scope.row.NCM_OPERATION? scope.row.NCM_OPERATION : '请选择' | operation_filter}}</a></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.NCM_OPERATION = 'GDZ'">固定褶</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.NCM_OPERATION = 'DQ'">打圈</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 包边方式 -->
              <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                <template v-if="scope.row.BIAN_ENABLE == 1">
                  <span>【包边方式】:{{ scope.row.NCM_BIAN | bian_filter }}</span>
                </template>
                <template v-if="scope.row.BIAN_ENABLE == 2">
                  <el-dropdown trigger="click">
                    <span>【包边方式】:<a
                        class="a-userset">{{ scope.row.NCM_BIAN? scope.row.NCM_BIAN : '请选择' | bian_filter}}</a></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.NCM_BIAN = '4B'">4S边</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.NCM_BIAN = '3B'">3.0边</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 备注 -->
              <div class="manufacturing-ct"
                v-if="scope.row.NCM_NOTE || scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE ">
                <span>【备注】:
                  <template v-if="scope.row.NCM_MAKETYPE">
                    {{scope.row.NCM_MAKETYPE | makeType_filter}}
                    <template v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template>
                  </template>
                  <template v-if="scope.row.NCM_JOINT">
                    {{scope.row.NCM_JOINT | joint_filter}}
                    <template v-if="scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template>
                  </template>
                  <template v-if="scope.row.NCM_WRINKLE">
                    {{scope.row.NCM_WRINKLE }}褶
                    <template v-if="scope.row.NCM_MAKETYPE">、</template>
                  </template>
                  <template v-if="scope.row.NCM_NOTE">
                    {{scope.row.NCM_NOTE }}
                  </template>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="60" align="center" prop="curtain_area">
            <template slot-scope="scope">
              <!-- 只有部件显示数量 -->
              <span v-if="scope.row.curtain_level == 0 && scope.row.TOTAL_ENABLE == 1">{{scope.row.curtain_area}}</span>
              <span v-else-if="scope.row.TOTAL_ENABLE == 2">
                <el-input v-model="scope.row.curtain_area" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" width="60" align="center" prop="UNIT_NAME"></el-table-column>
          <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
          <el-table-column label="单价" width="60" align="center" prop="curtain_price" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.curtain_level == 0">{{scope.row.curtain_price}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="折后" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.curtain_level == 0">{{ calculatePromotionPrice(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.curtain_level == 0">{{ oneTotal(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="说明" align="center"></el-table-column>
        </el-table>
        <div v-if="isManager != '0'" style="font-size:16px;margin-top:10px;margin-left: 985px;">
          <span>总计：<span style="color:red;">￥{{ allTotal | dosageFilter }}</span></span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import {
  GetPartTypeDataTabale,
  GetCurtainTemplateAndModel,
} from "@/api/newCurtainASP";
import { GetPromotionByItem } from "@/api/orderListASP";
import Cookies from "js-cookie";
import Axios from "axios";

export default {
  data() {
    return {
      cid: Cookies.get("cid"), //cid
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      searchKey: "DL407209K1",
      templateData: [], //查出来的原始数据
      curtainHeadData: {}, //帘款数据
      curtainDataOrigin: [], //拼接好的原始数据
      curtainData: [], //显示的窗帘数据
      curtainPartTypeData: [], //类型字典
      previewUrl: "",
      defaultUrl:
        "http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/J370010.jpg",
      activityOptions: [], //活动集合
    };
  },
  computed: {
    //当前选择的活动
    salPromotion() {
      var selectActivity = this.activityOptions.filter(
        (item) => item.P_ID == this.curtainHeadData.activityId
      );
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      var totalMoney = 0;
      //找到勾选的
      for (var i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].curtain_choose == true) {
          totalMoney = totalMoney.add(this.oneTotal(this.curtainData[i]));
        }
      }
      return totalMoney;
    },
  },
  filters: {
    meshutie_filter(value) {
      switch (value) {
        case "ZC":
          return "正车";
          break;
        case "FC":
          return "反车";
          break;
        default:
          return value;
          break;
      }
    },
    kaikou_filter(value) {
      switch (value) {
        case "TK":
          return "对开";
          break;
        case "DK":
          return "单开";
          break;
        case "SK":
          return "特殊开";
          break;
        default:
          return value;
          break;
      }
    },
    operation_filter(value) {
      switch (value) {
        case "GDZ":
          return "固定褶";
          break;
        case "DQ":
          return "打圈";
          break;
        default:
          return value;
          break;
      }
    },
    bian_filter(value) {
      switch (value) {
        case "4B":
          return "4S边";
          break;
        case "3B":
          return "3.0边";
          break;
        default:
          return value;
          break;
      }
    },
    makeType_filter(value) {
      switch (value) {
        case "01":
          return "定宽制作";
          break;
        case "02":
          return "定高制作";
          break;
      }
    },
    joint_filter(value) {
      switch (value) {
        case "SP":
          return "竖拼接";
          break;
        case "HP":
          return "横拼接";
          break;
      }
    },
  },
  methods: {
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTabale().then((res) => {
        console.log("字典", res);
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter(
        (item) => item.NC_PART_TYPECODE == val
      );
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //搜索窗帘
    searchCurtain() {
      this.templateData = [];
      this.curtainHeadData = {};
      this.curtainData = [];
      this.curtainDataOrigin = [];
      GetCurtainTemplateAndModel({ item_no: this.searchKey }).then((res) => {
        console.log("模板", res);
        this.templateData = res.data;
        if (this.templateData.length) {
          //帘款
          var headData = this.templateData.filter(
            (item) => item.NC_PART_TYPECODE == "LK"
          );
          if (headData.length) {
            this.curtainHeadData = headData[0];
            //宽高，活动
            this.$set(this.curtainHeadData, "width", 0);
            this.$set(this.curtainHeadData, "height", 0);
            this.$set(this.curtainHeadData, "activityId", "");
            this.$set(this.curtainHeadData, "location", "");
            //加载活动
            this.getActivity();
          }
          //预览图片
          this.previewUrl = `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${this.curtainHeadData.ITEM_NO}.jpg`;
          //拼接出窗帘
          for (var i = 0; i < this.templateData.length; i++) {
            var oneTemplate = this.templateData[i];
            if (oneTemplate.NC_PART_TYPECODE == "LK") continue;
            if (oneTemplate.curtain_model == null) {
              //没有选择结构的，只保留机构，其他用未选择
              var tempData = {
                NC_PART_TYPECODE: oneTemplate.NC_PART_TYPECODE,
                //其他属性不需要吧
              };
            } else {
              //其他直接拼接上去
              this.curtainData.push(...oneTemplate.curtain_model);
            }
          }
          this.getCurtainOtherMsg();
        }
      });
    },
    getActivity() {
      this.activityOptions = [];
      GetPromotionByItem({
        cid: this.cid,
        customerType: this.customerType,
        itemNo: this.curtainHeadData.ITEM_NO,
        itemVersion: this.curtainHeadData.ITEM_VERSION,
        productType: this.curtainHeadData.PRODUCT_TYPE,
        productBrand: this.curtainHeadData.PRODUCT_BRAND,
      }).then((res) => {
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: null,
        });
        var defaultSel = {
          pri: 0,
          id: 0,
        };
        for (var j = 0; j < res.data.length; j++) {
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
        }

        if (defaultSel.pri != 0) {
          this.curtainHeadData.activityId = defaultSel.id;
        }
      });
    },
    //添加其他没有的字段
    async getCurtainOtherMsg() {
      //除了后台查出来的数据以外前端需要的数据
      for (var i = 0; i < this.curtainData.length; i++) {
        //窗帘层级
        var level = 0;
        var NCM_PID = this.curtainData[i].NCM_PID;
        while (NCM_PID != 0) {
          var temp = this.curtainData.filter(
            (item) => item.NC_MODEL_ID == NCM_PID
          );
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(this.curtainData[i], "curtain_level", level);
        //选中标识(父节点以部件为准，子节点综合父节点考虑)
        var defaultChose =
          this.curtainData[i].NCT_DELETE < 2 &&
          this.curtainData[i].NCM_DELETE < 2;
        this.$set(this.curtainData[i], "curtain_choose", true);
        //单价
        var price = this.getPrice(this.customerType, this.curtainData[i]);
        this.$set(this.curtainData[i], "curtain_price", price);
        //宽
        this.$set(this.curtainData[i], "curtain_width", 0);
        //高
        this.$set(this.curtainData[i], "curtain_height", 0);
        //总数（面积）
        var area = 0;
        if (this.curtainData[i].NC_PART_TYPECODE == "GBD") area = 1; //挂绑带默认为1
        this.$set(this.curtainData[i], "curtain_area", area);
        //左转角
        this.$set(this.curtainData[i], "curtain_left_filet", 0);
        //右转角
        this.$set(this.curtainData[i], "curtain_right_filet", 0);
      }
      //库存另外循环，防止阻塞出现数据错误
      for (var i = 0; i < this.curtainData.length; i++) {
        //库存
        var postData = {
          token: "兰居尚品",
          code: this.curtainData[i].ITEM_NO,
        };
        try {
          var resStore = await Axios.post(
            "http://ljsp.ubxiu.com:8098/api/getXXDMX",
            postData,
            { params: postData, loading: false }
          );
          if (resStore.data && resStore.data.data) {
            this.$set(
              this.curtainData[i],
              "curtain_store",
              resStore.data.data.kucun
            );
          }
        } catch (err) {
          console.log(err);
        }
      }
      console.log("窗帘", this.curtainData);
    },
    //根据客户类型获取价格
    getPrice(type, item) {
      var price = 0;
      if (item) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.PRICE_SALE;
        } else if (type == "05") {
          price = item.SALE_PRICE;
        } else if (type == "06") {
          price = item.PRICE_FX;
        } else if (type == "09") {
          price = item.PRICE_HOME;
        }
      }
      return price;
    },
    //改变成品宽
    changeHeadWidth(val) {
      for (var i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].WIDTH_ENABLE > 0) {
          this.curtainData[i].curtain_width = this.dosageFilter(
            val * this.curtainData[i].NCM_WIDTH_RATIO
          );
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变成品高
    changeHeadHeight(val) {
      for (var i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].WIDTH_ENABLE > 0) {
          this.curtainData[i].curtain_height = this.dosageFilter(
            val * this.curtainData[i].NCM_HEIGHT_RATIO
          );
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变单个宽或者高
    changeOneWidthOrHeight(val, index) {
      this.curtainData[index].curtain_area = this.dosageFilter(
        this.curtainData[index].curtain_width *
          this.curtainData[index].curtain_height
      );
      if (this.curtainData[index].NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainData.filter(
          (item) => item.NC_PART_TYPECODE == "LCB"
        );
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].curtain_area = this.curtainData[index].curtain_area;
        }
      }
    },
    //计算折后价格
    calculatePromotionPrice(data) {
      var price = 0;
      //首先判断TYPE,1折扣，2定价
      if (this.salPromotion && this.salPromotion.P_ID) {
        switch (this.salPromotion.TYPE) {
          case "1":
            //折扣
            price = data.curtain_price.mul(this.salPromotion.DISCOUNT);
            break;
          case "2":
            //定价
            price = this.salPromotion.PRICE;
        }
      } else {
        price = data.curtain_price;
      }
      return this.dosageFilter(price);
    },
    oneTotal(row) {
      var price = this.calculatePromotionPrice(row);
      return price.mul(row.curtain_area);
    },
    //合并第一列显示预览
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex == 0) {
          return {
            rowspan: this.curtainData.length,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    //显示默认图片
    showDefaultImg(e) {
      this.previewUrl = this.defaultUrl;
    },
  },
  mounted() {
    this.getPartTypeData();
  },
};
</script>

<style scoped>
.curtain-contain {
  margin-top: 10px;
  padding: 5px 10px;
  border: 1px solid #eee;
}
.curtain-parent-item {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.curtain-params {
  text-align: center;
  margin-top: 10px;
}
.curtain-list {
  margin-top: 10px;
}
.curtain-preview {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
.a-link {
  text-decoration: underline;
  cursor: pointer;
}
.a-userset {
  color: #409eff;
  background: 0 0;
  text-decoration: none;
  outline: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
.manufacturing-ct {
  padding: 2px;
}
</style>
<style>
.curtain-table .el-input__inner {
  padding: 0 5px;
  height: 20px;
}
</style>
