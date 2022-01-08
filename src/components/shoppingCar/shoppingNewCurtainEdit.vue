<template>
  <el-card shadow="never">
    <div class="curtain-contain" v-if="curtainMsg">
      <!-- 帘款 -->
      <div class="curtain-parent-item">
        <span>帘款：{{curtainHeadData.MODEL_NUMBER}}</span>
      </div>
      <!-- 帘款参数 -->
      <div class="curtain-params">
        <!-- 成品宽 -->
        <span>成品宽<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.WIDTH" @input="changeHeadWidth" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 成品高 -->
        <span style="margin-left:10px;">成品高<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.HEIGHT" @input="changeHeadHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 暗槽高 -->
        <span style="margin-left:10px;">暗槽高<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.ANCAO_HEIGHT" @input="changeAncaoHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 活动 -->
        <span style="margin-left:10px;">活动：</span>
        <el-select size="mini" style="width:220px" v-model="curtainHeadData.ACTIVITY_ID">
          <el-option v-for="item in activityOptions" :key="item.P_ID"
            :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
          </el-option>
        </el-select>
        <span style="color:red;font-size:14px;"
          v-if="curtainMsg && curtainMsg.activityId === curtainMsg.activityName && curtainMsg.activityEffective != null && !curtainMsg.activityEffective">此活动已经过期，请重新选择</span>
        <!-- 位置 -->
        <span style="margin-left:10px;">位置<span style="color:red;">*</span>：</span>
        <el-input style="width:100px;" v-model="curtainHeadData.LOCATION" size="mini"></el-input>
        <!-- 套数 -->
        <span style="margin-left:10px;">套数<span style="color:red;">*</span>：</span>
        <el-input style="width:50px;" v-model="curtainHeadData.COUNT" size="mini" oninput="value=value.replace(/[^\d]/g,'')">
        </el-input>
      </div>
      <div class="curtain-list">
        <el-table :data="curtainHeadData.curtains" ref="curtainTable" class="curtain-table" border :span-method="cellMerge"
          :row-class-name="tableRowClassName">
          <el-table-column label="预览" width="120" align="center">
            <template slot-scope="scope">
              <!-- 显示图片预览 -->
              <div v-for="(item,index) in previewUrlList" :key="index">
                <!-- <img v-if="item.show" class="curtain-preview" :src="item.src" @error="showDefaultImg(index)" /> -->
                <el-image v-if="item.show" class="curtain-preview" :src="item.src" fit="fill" @error="showDefaultImg(index)"
                  :preview-src-list="showPreviewUrlList"></el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
            <template slot-scope="scope">
              <!-- 树缩进 -->
              <span v-if="scope.row.curtain_level > 0">
                <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
              </span>
              <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
            <template slot-scope="scope">
              <!-- 是否可替换 -->
              <span :class="{ 'a-link': itemCanChange(scope.row), 'delete-cls': !scope.row.curtain_choose }"
                @click="itemCanChange(scope.row) && exchangeModelOrItem(scope.row)">
                <!-- 标定 -->
                <template v-if="scope.row.ITEM_NO">
                  {{scope.row.ITEM_NO}}
                </template>
                <template v-else-if="scope.row.NC_PART_TYPECODE == 'LBT'">
                  <span style="color:red;">未维护数据!</span>
                </template>
                <!-- 没有模板，非标定 -->
                <template v-else>
                  请选择
                </template>
              </span>
              <!-- 是否可删/是否默认勾选 -->
              <el-checkbox v-if="itemCanDelete(scope.row)" v-model="scope.row.curtain_choose"
                @change="onCheckChange($event, scope.row)"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="名称" width="80" header-align="center" prop="CURTAIN_ITEM_NAME">
          </el-table-column>
          <el-table-column label="制造说明" width="280" header-align="center">
            <template slot-scope="scope">
              <!-- N个配置项逐个检测 -->
              <!-- 宽，高 -->
              <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                <template v-if="scope.row.WIDTH_ENABLE == 1">
                  <span>【宽】: {{ scope.row.WIDTH }}m</span>
                </template>
                <template v-else-if="scope.row.WIDTH_ENABLE == 2">
                  <span>【宽】: <el-input v-model="scope.row.WIDTH" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.HEIGHT_ENABLE == 1">
                  <span>【高】: {{ scope.row.HEIGHT }}m</span>
                </template>
                <template v-else-if="scope.row.HEIGHT_ENABLE == 2">
                  <span>【高】: <el-input v-model="scope.row.HEIGHT" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
              </div>
              <!-- 左右转角 -->
              <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                <template v-if="scope.row.LEFT_ENABLE == 1">
                  <span>【左转角】: {{ scope.row.LEFT_FILLET }}m</span>
                </template>
                <template v-else-if="scope.row.LEFT_ENABLE == 2">
                  <span>【左转角】: <el-input v-model="scope.row.LEFT_FILLET" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.RIGHT_ENABLE == 1">
                  <span>【右转角】: {{ scope.row.RIGHT_FILLET }}m</span>
                </template>
                <template v-else-if="scope.row.RIGHT_ENABLE == 2">
                  <span>【右转角】: <el-input v-model="scope.row.RIGHT_FILLET" style="width:40px;" size="mini"
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
                  <span>【么术贴】: {{ scope.row.MESUTIE | meshutie_filter}}</span>
                </template>
                <template v-else-if="scope.row.TIE_ENABLE == 2">
                  <span>【么术贴】: </span>
                  <el-dropdown trigger="click" @command="handleMesutieCommand($event, scope.$index)">
                    <a class="a-userset">{{ scope.row.MESUTIE? scope.row.MESUTIE : '请选择' | meshutie_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="ZC">正车</el-dropdown-item>
                      <el-dropdown-item command="FC">反车</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 打开方式 -->
              <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                <template v-if="scope.row.KAIKOU_ENABLE == 1">
                  <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                </template>
                <template v-else-if="scope.row.KAIKOU_ENABLE == 2">
                  <span>【打开方式】: </span>
                  <el-dropdown trigger="click" @command="handleKaikouCommand($event, scope.$index)">
                    <a class="a-userset">{{ scope.row.KAIKOU? scope.row.KAIKOU : '请选择' | kaikou_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="TK">对开</el-dropdown-item>
                      <el-dropdown-item command="DK">左单开</el-dropdown-item>
                      <el-dropdown-item command="RDK">右单开</el-dropdown-item>
                      <el-dropdown-item command="SK">特殊开</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 工艺方式 -->
              <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                <template v-if="scope.row.OPERATION_ENABLE == 1">
                  <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                </template>
                <template v-else-if="scope.row.OPERATION_ENABLE == 2">
                  <span>【工艺方式】: </span>
                  <el-dropdown trigger="click" @command="handleOperationCommand($event, scope.$index)">
                    <a class="a-userset">{{ scope.row.OPERATION? scope.row.OPERATION : '请选择' | operation_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="GDZ">固定褶</el-dropdown-item>
                      <el-dropdown-item command="DQ">打圈</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 包边方式 -->
              <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                <template v-if="scope.row.BIAN_ENABLE == 1">
                  <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                </template>
                <template v-else-if="scope.row.BIAN_ENABLE == 2">
                  <span>【包边方式】: </span>
                  <el-dropdown trigger="click" @command="handleBianCommand($event, scope.$index)">
                    <a class="a-userset">{{ scope.row.BIAN? scope.row.BIAN : '请选择' | bian_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="4B">4S边</el-dropdown-item>
                      <el-dropdown-item command="3B">3.0边</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 说明 -->
              <div class="manufacturing-ct"
                v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                      v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                  <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                      v-if="scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                  <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                      v-if="scope.row.NCM_NOTE">、</template></template>
                  <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
            <template slot-scope="scope">
              <!-- 只有部件显示用量 -->
              <span
                v-if="scope.row.curtain_level == 0 && scope.row.TOTAL_ENABLE == 1">{{scope.row.DOSAGE}}{{scope.row.UNIT_NAME}}</span>
              <span v-else-if="scope.row.TOTAL_ENABLE == 2">
                <el-input v-model="scope.row.DOSAGE" style="width:40px;" size="mini" @input="changeLSArea($event, scope.$index)"
                  oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                {{scope.row.UNIT_NAME}}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="70" align="center" prop="curtain_store"></el-table-column>
          <el-table-column label="单价" width="60" align="center" prop="PRICE" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="折后" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{ calculatePromotionPrice(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{ oneTotal(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="说明" width="100" header-align="center" prop="ILLUSTRATE">
            <template slot-scope="scope">
              <span style="color:red;font-size:12px;"> {{ scope.row.ILLUSTRATE }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="NOTE">
            <template slot-scope="scope">
              <el-input v-if="scope.row.ITEM_NO " :disabled="scope.row.KAIKOU != 'SK'" v-model="scope.row.NOTE" size="mini"
                type="textarea" resize="none" :autosize="{ maxRows: 6 }" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <span v-if="isManager != '0'" style="font-size:16px;margin-left: 820px;">
            总计：<span style="color:red;">￥{{ allTotal | dosageFilter }}</span>
          </span>
        </div>
        <div style="text-align:center;margin:0 0 20px 0;">
          <el-button type="primary" width="130px" @click="resolveModify">确认修改</el-button>
          <el-button type="info" style="margin-left: 20px;" width="130px" @click.native="closeTable">
            返回
          </el-button>
        </div>
      </div>
    </div>
    <!-- 替换组件 -->
    <el-drawer :title='"【" + transPartTypeCode(exchangeModelTemplate.NC_PART_TYPECODE) + "】" + "可替换列表"' :visible.sync="drawerShow"
      :with-header="false" :size="isManager!='0'?'730px':'670px'">
      <div style="padding:0 10px;margin-bottom:10px;">
        <el-input clearable v-model.trim="modelCondition" @clear="getExchangeModelList" size="small"
          @keyup.enter.native="getExchangeModelList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExchangeModelList" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <span style="color:grey;margin-left:10px;">*单击选择</span>
      </div>
      <div class="model-exchange-list">
        <div class="model-exchange-list-ct">
          <div v-for="(item, index) in exchangeModelList" :key="index" class="model-exchange-ct"
            :class="{'model-exchange-now': item.NC_MODEL_ID == exchangeModelNow.NC_MODEL_ID }" @click="onChangeModelClick(item)">
            <div class="model-exchange-inner">
              <el-table :data="item.curtain_model" border :style="{width: isManager!='0'?'670px':'610px'}"
                :row-class-name="tableRowClassName">
                <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                  <template slot-scope="scope">
                    <!-- 树缩进 -->
                    <span v-if="scope.row.curtain_level > 0">
                      <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                    </span>
                    <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
                </el-table-column>
                <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
                </el-table-column>
                <el-table-column label="库存" width="70" align="center" prop="curtain_store"></el-table-column>
                <el-table-column label="单价" width="60" align="center" prop="PRICE" v-if="isManager != '0'">
                  <template slot-scope="scope">
                    <!-- 只有部件算钱 -->
                    <span v-if="scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="说明" header-align="center" prop="NOTE">
                  <template slot-scope="scope">
                    <template v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template>
                  </template>
                </el-table-column>
              </el-table>
              <label class="default-model-label" v-if="item.NC_MODEL_ID == exchangeModelTemplate.NC_MODEL_ID">默认组件</label>
              <!-- 序号 -->
              <el-badge class="index-badge" :value="index+1" />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    <!-- 替换子件 -->
    <el-drawer :title='"【" + exchangeItemNow.ITEM_NO + " " + exchangeItemNow.NOTE + "】" +  "可替换列表"' :visible.sync="drawerShow2"
      :with-header="false" size="530px">
      <div style="padding:0 10px;margin-bottom:10px;">
        <el-input clearable v-model.trim="itemCondition" @clear="getExchangeItemList" size="small"
          @keyup.enter.native="getExchangeItemList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExchangeItemList" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <span style="color:grey;margin-left:10px;">*单击选择</span>
      </div>
      <div class="item-exchange-list">
        <div class="item-exchange-list-ct">
          <div v-for="(item, index) in exchangeItemList" :key="index" class="item-exchange-ct"
            :class="{'item-exchange-now': item.ITEM_NO == exchangeItemNow.ITEM_NO }" @click="onChangeItemClick(item)">
            <span>{{item.ITEM_NO + " " + item.NOTE}}</span>
            <label class="default-item-label" v-if="item.ITEM_NO == exchangeItemDefault.ITEM_NO">默认</label>
          </div>
        </div>
      </div>
      <el-pagination class="tc mt10" @current-change="getExchangeItemList" :current-page.sync="currentPage" :page-size="limit"
        layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-drawer>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import Axios from "axios";
import { mapActions } from "vuex";
import { GetPromotionByItem, GetUnImportOrder, GetUnImportOrderByItem } from "@/api/orderListASP";
import {
  GetPartTypeDataTable,
  GetExchangeModel,
  GetExchangeModelItem,
  GetNewCurtainDetail,
  UpdateNewCurtainCart,
  GetNewCurtainParams
} from "@/api/newCurtainASP";

export default {
  data() {
    return {
      cid: Cookies.get("cid"), //cid
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      curtainMsg: {},
      curtainHeadData: {},
      activityOptions: [],
      curtainPartTypeData: [],
      previewUrlList: [],
      drawerShow: false,
      drawerShow2: false,
      exchangeModelList: [],
      exchangeModelTemplate: {},
      exchangeModelNow: {},
      modelCondition: "",
      exchangeItemList: [],
      exchangeItemNow: [],
      exchangeItemDefault: {},
      itemCondition: "",
      currentPage: 0,
      limit: 50,
      totalNumber: 0,
      oldCurtainData: [],
      minimumQty_lt: 1,
      minimumQty_ls: 4,
    }
  },
  computed: {
    salPromotion() {
      var selectActivity = this.activityOptions.filter(item => item.P_ID == this.curtainHeadData.ACTIVITY_ID);
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      var totalMoney = 0;
      //找到勾选的
      if (this.curtainHeadData.curtains && this.curtainHeadData.COUNT) {
        for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
          var oneCurtain = this.curtainHeadData.curtains[i];
          if (oneCurtain.curtain_choose == true && oneCurtain.curtain_level == 0) {
            totalMoney = totalMoney.add(this.oneTotal(oneCurtain));
          }
        }
        totalMoney = totalMoney * this.curtainHeadData.COUNT;
      }
      return totalMoney;
    },
    chooseCurtainData() {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        oneCurtain.ITEM_ID = oneCurtain.ITEM_NO;
      }
      return this.curtainHeadData.curtains.filter(item => item.curtain_choose);
    },
    deleteCurtainData() {
      var deleteIds = [];
      for (var i = 0; i < this.oldCurtainData.length; i++) {
        var oldOneCurtain = this.oldCurtainData[i];
        var hasThis = this.chooseCurtainData.filter(item => item.ID == oldOneCurtain.ID);
        if (!hasThis.length) {
          if (oldOneCurtain.ID) deleteIds.push(oldOneCurtain);
        }
      }
      return deleteIds;
    },
    showPreviewUrlList() {
      var urlList = [];
      for (var i = 0; i < this.previewUrlList.length; i++) {
        if (this.previewUrlList[i].show) urlList.push(this.previewUrlList[i].src)
      }
      return urlList;
    }
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
    },
    transSaleId(value) {
      switch (value) {
        case "A":
          return "销售";
          break;
        case "B":
          return "待淘汰";
          break;
        case "C":
          return "淘汰";
          break;
        case "D":
          return "内留";
          break;
        case "E":
          return "外留";
          break;
        case "F":
          return "永久淘汰";
          break;
      }
    },
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
          return "左单开";
          break;
        case "RDK":
          return "右单开";
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
    ...mapActions("navTabs", ["closeToTab"]),
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTable().then((res) => {
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter(item => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //最小下单量参数
    getCurtainParams() {
      GetNewCurtainParams().then(res => {
        var param1 = res.data.filter(item => item.NCP_TYPE == 'MINIMUMQUANTITY' && item.NCP_CODE == 'LT');
        if (param1.length) this.minimumQty_lt = param1[0].NCP_VALUE;
        var param2 = res.data.filter(item => item.NCP_TYPE == 'MINIMUMQUANTITY' && item.NCP_CODE == 'LS');
        if (param2.length) this.minimumQty_ls = param2[0].NCP_VALUE;
      })
    },
    //找到需要加载拉边条的面料
    getLBTMLItem() {
      var lbtmlItem = undefined;
      //先找到帘身
      var lsItem = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == 'LS');
      if (lsItem.length) {
        lsItem = lsItem[0];
        //找到帘身下面的子件
        var mlList = this.curtainHeadData.curtains.filter(item =>
          item.NCM_PID == lsItem.NC_MODEL_ID &&
          item.NC_PART_TYPECODE != "LBT" &&
          item.curtain_choose
        );
        //按照2褶，1褶，上横拼配布，下横拼配布，主布的顺序找
        lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'PB2');
        if (lbtmlItem.length) {
          lbtmlItem = lbtmlItem[0];
        } else {
          lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'PB1');
          if (lbtmlItem.length) {
            lbtmlItem = lbtmlItem[0];
          } else {
            lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'SHPPB');
            if (lbtmlItem.length) {
              lbtmlItem = lbtmlItem[0];
            } else {
              lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'XHPPB');
              if (lbtmlItem.length) {
                lbtmlItem = lbtmlItem[0];
              } else {
                lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'ZB');
                if (lbtmlItem.length) {
                  lbtmlItem = lbtmlItem[0];
                }
              }
            }
          }
        }
      }
      return lbtmlItem;
    },
    //获得活动
    getActivity() {
      this.activityOptions = [];
      GetPromotionByItem({
        cid: this.cid,
        customerType: this.customerType,
        itemNo: this.curtainMsg.modelNumber,
        itemVersion: this.curtainMsg.item.itemVersion,
        productType: this.curtainMsg.item.productType,
        productBrand: this.curtainMsg.item.productBrand,
      }, { loading: false }
      ).then((res) => {
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: "",
        });
      });
    },
    getDetail() {
      GetNewCurtainDetail({ cartItemId: this.curtainMsg.cartItemId }).then(res => {
        this.curtainHeadData = res.data;
        //预览图片
        this.previewUrlList.push({
          type: 'LK',
          src: `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${this.curtainHeadData.MODEL_NUMBER}.jpg`,
          show: true
        })
        this.dealCurtainData();
      })
    },
    //处理窗帘数据
    dealCurtainData() {
      var detail = this.curtainHeadData;

      for (var j = 0; j < detail.curtains.length; j++) {
        var oneCurtain = detail.curtains[j];
        //窗帘层级
        var level = 0;
        var NCM_PID = oneCurtain.NCM_PID;
        while (NCM_PID != 0) {
          var temp = detail.curtains.filter(item => item.NC_MODEL_ID == NCM_PID);
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(oneCurtain, "curtain_level", level);
        //选中标识
        this.$set(oneCurtain, "curtain_choose", true);
        //库存
        this.$set(oneCurtain, "curtain_store", "");
        //push到olddata中，用来对比
        this.oldCurtainData.push(JSON.parse(JSON.stringify(oneCurtain)))
        //预览图片
        if (!this.curtainHeadData.isStandard) {
          if (oneCurtain.NC_PART_TYPECODE == 'LT' || oneCurtain.NC_PART_TYPECODE == 'LS' || oneCurtain.NC_PART_TYPECODE == 'CS') {
            this.updateOrAddPicture(oneCurtain);
          }
        }
      }
      detail.curtains = this.getStoreData(detail.curtains);

      //把change的数据也加上各个字段
      for (var j = 0; j < detail.curtain_change.length; j++) {
        var oneCurtain = detail.curtain_change[j];
        //窗帘层级
        var level = 0;
        var NCM_PID = oneCurtain.NCM_PID;
        while (NCM_PID != 0) {
          var temp = detail.curtain_change.filter(item => item.NC_MODEL_ID == NCM_PID);
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(oneCurtain, "curtain_level", level);
        //选中标识
        this.$set(oneCurtain, "curtain_choose", true);
        //单价
        var price = this.getPrice(this.cus_customerType, oneCurtain);
        this.$set(oneCurtain, "PRICE", price);
        //宽
        var curtain_width = 0;
        if (oneCurtain.WIDTH_ENABLE > 0) {
          curtain_width = this.dosageFilter(detail.WIDTH * oneCurtain.NCM_WIDTH_RATIO);
        }
        this.$set(oneCurtain, "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            curtain_height = this.dosageFilter((detail.HEIGHT - detail.ANCAO_HEIGHT) * 10 * 0.0235 - 0.11);
          } else {
            curtain_height = this.dosageFilter(detail.HEIGHT * oneCurtain.NCM_HEIGHT_RATIO);
          }
        }
        //总数（面积）
        var dosage = this.dosageFilter(curtain_width * curtain_height);
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
        if (oneCurtain.NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = detail.curtain_change.filter(item => item.NC_PART_TYPECODE == "LCB");
          for (var k = 0; k < LCBITEM.length; k++) {
            //假设有多个里衬布的情况
            LCBITEM[k].DOSAGE = dosage;
          }
        }
        //左转角
        this.$set(oneCurtain, "LEFT_FILLET", 0);
        //右转角
        this.$set(oneCurtain, "RIGHT_FILLET", 0);
        //库存
        this.$set(oneCurtain, "curtain_store", "");
        //客户备注
        this.$set(oneCurtain, "curtain_note", "");
        //说明
        this.$set(oneCurtain, "ILLUSTRATE", "");
      }
      detail.curtain_change = this.getStoreData(detail.curtain_change);
    },
    //把model数据转换为comodity数据
    dealInsertData(data) {
      var returnData = {
        ...data,
        PRICE: data.PRICE,
        ITEM_ID: data.ITEM_NO,
        WIDTH: data.curtain_width,
        HEIGHT: data.curtain_height,
        NOTE: "",
        UNIT: data.UNIT_NAME,
        CURTAIN_ITEM_NAME: data.NOTE,
        CURTAIN_PART_NAME: this.transPartTypeCode(data.NC_PART_TYPECODE),
        DOSAGE: data.DOSAGE,
        ILLUSTRATE: data.ILLUSTRATE,
        INLINE_NO: 0,
        KAIKOU: data.NCM_KAIKOU,
        OPERATION: data.NCM_OPERATION,
        BIAN: data.NCM_BIAN,
        JOINT: data.NCM_JOINT,
        WRINKLE: data.NCM_WRINKLE,
        MAKETYPE: data.NCM_MAKETYPE,
        MESUTIE: data.NCM_MESUTIE,
        LEFT_FILLET: data.LEFT_FILLET,
        RIGHT_FILLET: data.RIGHT_FILLET,
      }
      return returnData;
    },
    //查找库存
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        if (!oneCurtain.ITEM_NO) continue;
        if (oneCurtain.curtain_level == 0) continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: oneCurtain.ITEM_NO,
        };
        Axios.defaults.withCredentials = false;
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var itemNo = res.data.data.code;
            GetUnImportOrderByItem({ itemNo: itemNo }, { loading: false }).then(res2 => {
              var store_charge = "";
              var kucun = res.data.data.kucun ? res.data.data.kucun : 0;
              var dinghuoshu = res.data.data.dinghuoshu ? res.data.data.dinghuoshu : 0;
              var xiaxian = res.data.data.xiaxian ? res.data.data.xiaxian : 0;
              var ddz = 0;
              if (res2.data.length) ddz = res2.data[0].DOSAGE;
              var store_num = kucun - dinghuoshu - ddz;
              if (store_num >= xiaxian) {
                store_charge = "充足";
              } else if (store_num > 0 && store_num < xiaxian) {
                store_charge = "量少待查";
              } else if (store_num < 0) {
                store_charge = "欠料待审";
              }
              var data = originData.filter(item => item.ITEM_NO == itemNo);
              if (data.length) {
                for (var j = 0; j < data.length; j++) {
                  data[j].curtain_store = store_charge;
                }
              }
            })
          }
        }).catch(res => { });
      }
      return originData;
    },
    //根据客户类型获取价格
    getPrice(type, item) {
      var price = 0;
      //只有第一级需要计算价格
      if (item && item.curtain_level == 0) {
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
    //转换数字
    convertNumber(val) {
      if (typeof val === 'number' && !isNaN(val)) return val;
      if (typeof val === 'string') {
        if (Number(val) != NaN) return Number(val);
      }
      return 0;
    },
    //改变成品宽
    changeHeadWidth(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.WIDTH_ENABLE > 0) {
          var width = this.convertNumber(this.curtainHeadData.WIDTH);
          oneCurtain.WIDTH = this.dosageFilter(width * oneCurtain.NCM_WIDTH_RATIO);
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变成品高
    changeHeadHeight(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          var height = this.convertNumber(this.curtainHeadData.HEIGHT);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ANCAO_HEIGHT);
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            oneCurtain.HEIGHT = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          } else {
            oneCurtain.HEIGHT = this.dosageFilter(height * oneCurtain.NCM_HEIGHT_RATIO);
          }
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变暗槽高
    changeAncaoHeight(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.NC_PART_TYPECODE == 'LT') {
          var height = this.convertNumber(this.curtainHeadData.HEIGHT);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ANCAO_HEIGHT);
          //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
          oneCurtain.HEIGHT = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变单个宽或者高或左右转角
    changeOneWidthOrHeight(val, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      var curtain_width = this.convertNumber(oneCurtain.WIDTH);
      var curtain_height = this.convertNumber(oneCurtain.HEIGHT);
      var LEFT_FILLET = this.convertNumber(oneCurtain.LEFT_FILLET);
      var RIGHT_FILLET = this.convertNumber(oneCurtain.RIGHT_FILLET);
      // if (oneCurtain.NC_PART_TYPECODE == "LT") {
      //   //计算帘头用量 帘头用量=（帘头宽+左转角+右转角）*帘头高
      //   oneCurtain.DOSAGE = this.dosageFilter((curtain_width + LEFT_FILLET + RIGHT_FILLET) * curtain_height);
      // } else {
      //   oneCurtain.DOSAGE = this.dosageFilter(curtain_width * curtain_height);
      // }
      //2021.8.12修改，不需要+左转角+右转角了
      oneCurtain.DOSAGE = this.dosageFilter(curtain_width * curtain_height);
      //帘身改变同时改变里衬布的
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.curtainHeadData.curtains.indexOf(LCBITEM[i]));
        }
      }
      this.getRemark(index);
    },
    //直接改变帘身用量
    changeLSArea(val, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.curtainHeadData.curtains.indexOf(LCBITEM[i]));
        }
      }
      this.getRemark(index);
    },
    //计算折后价格
    calculatePromotionPrice(data) {
      var price = 0;
      if (data && data.PRICE) {
        //首先判断TYPE,1折扣，2定价
        if (this.salPromotion && this.salPromotion.P_ID) {
          switch (this.salPromotion.TYPE) {
            case "1":
              //折扣
              price = data.PRICE.mul(this.salPromotion.DISCOUNT);
              break;
            case "2":
              //定价
              price = this.salPromotion.PRICE;
          }
        } else {
          price = data.PRICE;
        }
      }
      return this.dosageFilter(price);
    },
    //一个子件的总价
    oneTotal(row, calculatePromotion = true) {
      var price = calculatePromotion ? this.calculatePromotionPrice(row) : row.PRICE;
      //最小下单量。帘头1.帘身里衬，窗纱3
      var DOSAGE = row.DOSAGE ? this.convertNumber(row.DOSAGE) : 0;
      if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < this.minimumQty_lt && DOSAGE > 0) {
        DOSAGE = this.minimumQty_lt;
      } else if ((row.NC_PART_TYPECODE == 'LS' || row.NC_PART_TYPECODE == 'LCB' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < this.minimumQty_ls && DOSAGE > 0) {
        DOSAGE = this.minimumQty_ls;
      }
      price = price.mul(DOSAGE)
      return price;
    },
    //改变么术贴
    handleMesutieCommand(common, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      oneCurtain.MESUTIE = common;
    },
    //改变打开方式
    handleKaikouCommand(common, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      oneCurtain.KAIKOU = common;
    },
    //改变工艺方式
    handleOperationCommand(common, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      oneCurtain.OPERATION = common;
    },
    //处理拉边条
    handleBianCommand(common, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      if (oneCurtain.NC_PART_TYPECODE == 'LS') {
        if (common == "4B" && oneCurtain.BIAN != "4B") {
          //显示拉边条
          //先看看当前数据有没有这个拉边条，有的话应该是bug
          var lbtItemNow = this.curtainHeadData.curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItemNow.length) return;
          //在修改后的数据中找到拉边条数据并push进去
          var lbtItem = this.curtainHeadData.curtain_change.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            lbtItem = this.dealInsertData(lbtItem);
            //找到需要显示拉边条的面料
            var lbtmlItem = this.getLBTMLItem();
            if (lbtmlItem.ITEM_NO) {
              this.curtainHeadData.curtains.push({ ...lbtItem });
              //强制改成对应的ITEM_NO
              this.curtainHeadData.curtains[this.curtainHeadData.curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              //排序
              this.curtainHeadData.curtains.sort((a, b) => {
                if (a.NCT_SORTNO == b.NCT_SORTNO) {
                  return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
                }
                return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
              });
            }
          }
        } else if (common == "3B" && oneCurtain.BIAN == "4B") {
          //去掉拉边条
          //找到有没有拉边条
          var lbtItem = this.curtainHeadData.curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          //应该只有一个拉边条，但是循环一下，保险
          for (var i = 0; i < lbtItem.length; i++) {
            this.curtainHeadData.curtains.splice(this.curtainHeadData.curtains.indexOf(lbtItem[i]), 1);
          }
        }
      }
      oneCurtain.BIAN = common;
    },
    //是否可改
    itemCanChange(row) {
      var canChange = true;
      if (row.curtain_level == 0) {
        canChange = row.NCT_CHANGE == 1;
      } else {
        var isStandardLT = false;
        if (!this.curtainHeadData.isStandard) {
          //非标定帘款的标定帘头的子件可修改
          var fatherCurtain = this.curtainHeadData.curtains.filter(item => item.NC_MODEL_ID == row.NCM_PID && item.NC_MODEL_ID != 0);
          if (fatherCurtain.length && fatherCurtain[0].NC_PART_TYPECODE == 'LT' && fatherCurtain[0].NCM_STANDARD != 'N')
            isStandardLT = true;
        }
        canChange = row.NCT_CHANGE == 1 && row.NCM_CHANGE == 1 || isStandardLT;
      }
      return canChange;
    },
    //是否可删
    itemCanDelete(row) {
      var canDelete = true;
      if (row.curtain_level == 0) {
        canDelete = row.NCT_DELETE > 0;
      } else {
        canDelete = row.NCT_DELETE > 0 && row.NCM_DELETE > 0;
      }
      return canDelete;
    },
    //勾选的联动处理
    onCheckChange(checked, row) {
      var childrenCurtain = this.curtainHeadData.curtains.filter(item => item.NCM_PID == row.NC_MODEL_ID && row.NC_MODEL_ID != 0);
      var fatherCurtain = this.curtainHeadData.curtains.filter(item => item.NC_MODEL_ID == row.NCM_PID && item.NC_MODEL_ID != 0);
      if (childrenCurtain.length) {
        //自身作为父节点，勾选或者取消，子节点应该同步
        for (var i = 0; i < childrenCurtain.length; i++) {
          childrenCurtain[i].curtain_choose = checked;
          //往下更新需要联动，往上更新不需要
          this.onCheckChange(checked, childrenCurtain[i]);
        }
      }
      if (fatherCurtain.length) {
        fatherCurtain = fatherCurtain[0];
        //自身作为子节点，分两种情况
        if (checked) {
          //子节点勾选，父节点肯定要勾选
          fatherCurtain.curtain_choose = checked;
          //勾选上的时候看需不需要加载自己的拉边条，看自己是不是最大排序的那个
          //从父节点看是否需要加载
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.BIAN == "4B") {
            //找到需要显示拉边条的面料
            var lbtmlItem = this.getLBTMLItem();
            if (lbtmlItem.ITEM_NO && lbtmlItem.ITEM_NO == row.ITEM_NO) {
              //先看看当前数据有没有拉边条，有的话应该是全选的时候这一条还没勾选上的时候上一条数据加载的
              var lbtItemNow = this.curtainHeadData.curtains.filter(item => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
              if (lbtItemNow.length) {
                //有的话直接更新
                lbtItemNow[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              } else {
                //在修改后的数据中找到拉边条数据并push进去
                var lbtItem = this.curtainHeadData.curtain_change.filter(item =>
                  item.NCM_PID == row.NCM_PID &&
                  item.NC_PART_TYPECODE == "LBT"
                );
                if (lbtItem.length) {
                  lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
                  lbtItem = this.dealInsertData(lbtItem);
                  this.curtainHeadData.curtains.push({ ...lbtItem });
                  //强制改成对应的ITEM_NO
                  this.curtainHeadData.curtains[this.curtainHeadData.curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
                  //排序
                  this.curtainHeadData.curtains.sort((a, b) => {
                    if (a.NCT_SORTNO == b.NCT_SORTNO) {
                      return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
                    }
                    return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
                  });
                }
              }
            }
          }
        } else {
          //取消勾选删掉对应的拉边条，并找有没有其他
          //从父节点看是否需要删除
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.BIAN == "4B") {
            var lbtItem = this.curtainHeadData.curtains.filter(item => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
            if (lbtItem.length) {
              //找到需要显示拉边条的面料
              var lbtmlItem = this.getLBTMLItem();
              if (lbtmlItem.ITEM_NO) {
                //有的话更新拉边条
                lbtItem[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              } else {
                //没有的话删除拉边条
                for (var i = 0; i < lbtItem.length; i++) {
                  this.curtainHeadData.curtains.splice(this.curtainHeadData.curtains.indexOf(lbtItem[i]), 1);
                }
              }
            }
          }
          //子节点取消勾选，如果同级没有其他勾选了，父节点取消勾选
          var brotherCurtain = this.curtainHeadData.curtains.filter(item => item.NCM_PID == row.NCM_PID && item.curtain_choose);
          if (brotherCurtain.length == 0)
            fatherCurtain.curtain_choose = checked;
        }
      }
      //帘身取消勾选，同时取消里衬布
      if (row.NC_PART_TYPECODE == 'LS' && !checked) {
        var LCBITEM = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var j = 0; j < LCBITEM.length; j++) {
          //假设有多个里衬布的情况
          LCBITEM[j].curtain_choose = checked;
          this.onCheckChange(checked, LCBITEM[j]);
        }
      }
    },
    //点击显示可替换列表
    exchangeModelOrItem(row) {
      if (!row.curtain_choose) return;
      if (row.curtain_level == 0) {
        //整个组件替换
        this.modelCondition = "";
        this.exchangeModelNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeModelList();
      } else {
        //子件替换
        this.itemCondition = "";
        this.exchangeItemNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeItemList();
      }
    },
    //获得可替换组件列表
    getExchangeModelList() {
      this.exchangeModelList = [];
      GetExchangeModel({
        NC_TEMPLATE_ID: this.exchangeModelNow.NC_TEMPLATE_ID,
        condition: this.modelCondition.toUpperCase()
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].NC_MODEL_ID != this.exchangeModelNow.NC_MODEL_ID)) {
          this.exchangeModelList = res.data;
          //默认数据
          this.exchangeModelTemplate = {
            NC_PART_TYPECODE: this.exchangeModelNow.NC_PART_TYPECODE,
            NC_MODEL_ID: this.exchangeModelNow.OLD_NC_MODEL_ID
          }
          for (var i = 0; i < this.exchangeModelList.length; i++) {
            var curtain_list = this.exchangeModelList[i].curtain_model;
            for (var j = 0; j < curtain_list.length; j++) {
              var oneCurtain = curtain_list[j];
              //添加层级数据
              var level = 0;
              var NCM_PID = oneCurtain.NCM_PID;
              while (NCM_PID != 0) {
                var temp = curtain_list.filter(item => item.NC_MODEL_ID == NCM_PID);
                if (temp.length) {
                  NCM_PID = temp[0].NCM_PID;
                  level++;
                }
              }
              this.$set(oneCurtain, "curtain_level", level);
              //勾选
              this.$set(oneCurtain, "curtain_choose", true);
              //单价
              var price = this.getPrice(this.customerType, oneCurtain);
              this.$set(oneCurtain, "PRICE", price);
              //库存
              this.$set(oneCurtain, "curtain_store", "");
            }
            //库存
            curtain_list = this.getStoreData(curtain_list);
          }
          this.drawerShow = true;
        } else {
          this.$message({
            message: "没有可替换的组件!",
            type: "warning",
            duration: 1000,
          });
        }
      });
    },
    //点击替换组件
    onChangeModelClick(model) {
      if (model.NC_MODEL_ID == this.exchangeModelNow.NC_MODEL_ID) return;
      var selectModel = model.curtain_model.filter(item => item.NC_MODEL_ID == model.NC_MODEL_ID);
      if (selectModel.length) {
        selectModel = selectModel[0];
        var msg = "";
        if (this.exchangeModelNow.ITEM_NO) {
          msg = `确认使用【${selectModel.ITEM_NO}】替换当前【${this.exchangeModelNow.ITEM_NO}】？`;
        } else {
          msg = `确认使用【${selectModel.ITEM_NO}】作为当前组件？`;
        }
        this.$confirm(msg, "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }).then(() => {
          //替换当前，第一步，把当前的删掉
          this.curtainHeadData.curtains = this.curtainHeadData.curtains.filter(item => item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          this.curtainHeadData.curtain_change = this.curtainHeadData.curtain_change.filter(item => item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          //第二步，把当前选中的push进去
          var curtain_temp = this.getOtherCurtainMsgForExchange(model.curtain_model);
          for (var i = 0; i < curtain_temp.length; i++) {
            curtain_temp[i] = this.dealInsertData(curtain_temp[i]);
            var oneCurtain = curtain_temp[i];
            if (oneCurtain.NC_PART_TYPECODE == "LBT") {
              //先看父节点需不需要加载出拉边条
              var fatherCurtain = curtain_temp.filter(item =>
                item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                item.BIAN_ENABLE > 0 &&
                item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //把拉边条push进去
                this.curtainHeadData.curtains.push({ ...oneCurtain });
                //找到需要显示拉边条的面料
                var lbtmlItem = this.getLBTMLItem();
                this.curtainHeadData.curtains[this.curtainHeadData.curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              }
            } else {
              this.curtainHeadData.curtains.push({ ...oneCurtain });
            }
          }
          this.curtainHeadData.curtains.sort((a, b) => {
            if (a.NCT_SORTNO == b.NCT_SORTNO) {
              return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
            }
            return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
          });
          this.curtainHeadData.curtain_change.push(...curtain_temp);
          //this.exchangeModelNow = selectModel;
          this.drawerShow = false;
          this.$nextTick(() => {
            this.$refs.curtainTable.doLayout();
          });
          this.getRemark();
          //非标定替换图片
          if (!this.curtainHeadData.isStandard) {
            var headCurtain = curtain_temp.filter(item => item.NCM_PID == 0);
            if (headCurtain.length) {
              headCurtain = headCurtain[0];
              if (headCurtain.NC_PART_TYPECODE == 'LT' || headCurtain.NC_PART_TYPECODE == 'LS' || headCurtain.NC_PART_TYPECODE == 'CS') {
                this.updateOrAddPicture(headCurtain);
              }
            }
          }
        }).catch(() => { });
      }
    },
    //添加其他没有的数据
    getOtherCurtainMsgForExchange(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        //默认选中
        var defaultChose = false;
        if (oneCurtain.curtain_level == 0) {
          //根节点的由父节点控制
          defaultChose = oneCurtain.NCT_DELETE < 2;
        } else {
          //子节点综合父节点考虑
          defaultChose = oneCurtain.NCT_DELETE < 2 && oneCurtain.NCM_DELETE < 2;
        }
        this.$set(oneCurtain, "curtain_choose", defaultChose);
        //宽
        var curtain_width = 0;
        if (oneCurtain.WIDTH_ENABLE > 0) {
          var width = this.convertNumber(this.curtainHeadData.WIDTH);
          curtain_width = this.dosageFilter(width * oneCurtain.NCM_WIDTH_RATIO);
        }
        this.$set(oneCurtain, "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          var height = this.convertNumber(this.curtainHeadData.HEIGHT);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ANCAO_HEIGHT);
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            curtain_height = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          } else {
            curtain_height = this.dosageFilter(height * oneCurtain.NCM_HEIGHT_RATIO);
          }
        }
        this.$set(oneCurtain, "curtain_height", curtain_height);
        //总数（面积）由于开始左右转角都是0，所以不用按公式
        var dosage = this.dosageFilter(curtain_width * curtain_height);
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
        if (oneCurtain.NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
          for (var j = 0; j < LCBITEM.length; j++) {
            //假设有多个里衬布的情况
            LCBITEM[j].DOSAGE = dosage;
          }
        }
        if (oneCurtain.NC_PART_TYPECODE == "LCB") {
          //如果后添加里衬布，导致里衬布没有用量
          var LSITEM = this.curtainHeadData.curtains.filter(item => item.NC_PART_TYPECODE == "LS");
          if (LSITEM.length && LSITEM[0].DOSAGE != undefined) {
            oneCurtain.DOSAGE = LSITEM[0].DOSAGE;
          }
        }
        //左转角
        this.$set(oneCurtain, "LEFT_FILLET", 0);
        //右转角
        this.$set(oneCurtain, "RIGHT_FILLET", 0);
        //客户备注
        this.$set(oneCurtain, "curtain_note", "");
        //说明
        this.$set(oneCurtain, "ILLUSTRATE", "");
      }
      return originData;
    },
    //获得可替换子件列表
    getExchangeItemList() {
      this.exchangeItemList = [];
      GetExchangeModelItem({
        NC_MODEL_ID: this.exchangeItemNow.NC_MODEL_ID,
        condition: this.itemCondition.toUpperCase(),
        page: this.currentPage,
        limit: this.limit,
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].ITEM_NO != this.exchangeItemNow.ITEM_NO)) {
          this.exchangeItemList = res.data;
          this.totalNumber = res.count;
          //默认物料(从替换后的找)
          var defaultItem = this.curtainHeadData.curtain_change.filter(item => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
          if (defaultItem.length) {
            this.exchangeItemDefault = defaultItem[0];
          }
          this.drawerShow2 = true;
        } else {
          this.$message({
            message: "没有可替换的物料!",
            type: "warning",
            duration: 1000,
          });
        }
      });
    },
    //点击替换子件
    onChangeItemClick(item) {
      if (item.ITEM_NO == this.exchangeItemNow.ITEM_NO) return;
      this.$confirm(`确认使用【${item.ITEM_NO}】替换当前【${this.exchangeItemNow.ITEM_NO}】？`, "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        //替换只是更换item,先替换下面这些字段
        var originItem = this.curtainHeadData.curtains.filter(item => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
        if (originItem.length) {
          originItem = originItem[0];
          originItem.ITEM_NO = item.ITEM_NO;
          originItem.ITEM_ID = item.ITEM_NO;
          originItem.UNIT_NAME = item.UNIT_NAME;
          originItem.FIX_GRADE = item.FIX_GRADE;
          originItem.CURTAIN_ITEM_NAME = item.NOTE;
          originItem.MATERIAL_NO = item.MATERIAL_NO;
        }
        //替换拉边条
        //找到需要显示拉边条的面料
        var lbtmlItem = this.getLBTMLItem();
        if (lbtmlItem.ITEM_NO && lbtmlItem.ITEM_NO == originItem.ITEM_NO) {
          //改变拉边条数据
          var lbtItem = this.curtainHeadData.curtains.filter(item =>
            item.NCM_PID == originItem.NCM_PID &&
            item.NC_PART_TYPECODE == "LBT"
          );
          if (lbtItem.length) {
            lbtItem[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
          }
        }
        //更新库存
        this.curtainHeadData.curtains = this.getStoreData(this.curtainHeadData.curtains);
        this.drawerShow2 = false;
        this.getRemark();
      }).catch(() => { });
    },
    beforeModify() {
      //表头
      if (!this.curtainHeadData.WIDTH || Number(this.curtainHeadData.WIDTH) == 0) {
        this.$alert("请填写帘款【成品宽】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.HEIGHT || Number(this.curtainHeadData.HEIGHT) == 0) {
        this.$alert("请填写帘款【成品高】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (this.curtainHeadData.ANCAO_HEIGHT === "" || this.curtainHeadData.ANCAO_HEIGHT === null) {
        this.$alert("请填写帘款【暗槽高】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.LOCATION) {
        this.$alert("请填写帘款【位置】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.COUNT || Number(this.curtainHeadData.COUNT) == 0) {
        this.$alert("请填写帘款【套数】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      //只看选中的
      if (!this.chooseCurtainData.length) {
        this.$alert("请至少选择一个明细！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      for (var i = 0; i < this.chooseCurtainData.length; i++) {
        var oneCurtain = this.chooseCurtainData[i];
        //编码
        if (!oneCurtain.ITEM_NO) {
          this.$alert(`${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}没有对应的编码，请检查！`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //宽高
        if (oneCurtain.WIDTH_ENABLE == 2 && (!oneCurtain.WIDTH || Number(oneCurtain.WIDTH) == 0)) {
          this.$alert(`请填写${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【宽】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (oneCurtain.HEIGHT_ENABLE == 2 && (!oneCurtain.HEIGHT || Number(oneCurtain.HEIGHT) == 0)) {
          this.$alert(`请填写${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (Number(oneCurtain.HEIGHT) < 0) {
          this.$alert(`${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】不能小于0`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //么术贴
        if (oneCurtain.TIE_ENABLE == 2 && !oneCurtain.MESUTIE) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【么术贴】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //打开方式
        if (oneCurtain.KAIKOU_ENABLE == 2 && !oneCurtain.KAIKOU) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【打开方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //工艺方式
        if (oneCurtain.OPERATION_ENABLE == 2 && !oneCurtain.OPERATION) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【工艺方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //包边方式
        if (oneCurtain.BIAN_ENABLE == 2 && !oneCurtain.BIAN) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【包边方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      }

      //拉边条的判断
      var lsItem = this.chooseCurtainData.filter(item => item.BIAN_ENABLE > 0 && item.BIAN == "4B");
      if (lsItem.length) {
        for (var i = 0; i < lsItem.length; i++) {
          //判断有没有拉边条
          var lbtItem = this.chooseCurtainData.filter(item => item.NCM_PID == lsItem[i].NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (!lbtItem.length) {
            this.$alert(`${this.transPartTypeCode(lsItem[i].NC_PART_TYPECODE)}选择了4S边，但没有拉边条，保存失败`, "提示", {
              confirmButtonText: "确定",
              type: "warning",
            });
            return false;
          }
        }
      }

      return true;
    },
    resolveModify() {
      //修改之前的验证
      if (!this.beforeModify()) return;
      UpdateNewCurtainCart({
        cartItem: this.curtainHeadData,
        commodities: this.chooseCurtainData,
        salPromotion: this.salPromotion,
        deleteIds: this.deleteCurtainData
      }).then(res => {
        this.$alert("修改成功!", "提示", {
          confirmButtonText: "好的",
          type: "success",
        });
        this.closeTable();
      })
    },
    //获得窗帘的说明
    getRemark(index) {
      var curtains = [];
      var curtainHeadData = this.curtainHeadData;
      var allCurtains = curtainHeadData.curtains;
      if (index == undefined) {
        curtains = allCurtains;
      } else {
        curtains.push(allCurtains[index]);
      }
      for (var i = 0; i < curtains.length; i++) {
        var oneCurtain = curtains[i];
        if (!oneCurtain.ITEM_NO) continue;
        //最小下单量。帘头1.帘身里衬，窗纱3
        if (oneCurtain.NC_PART_TYPECODE == 'LT') {
          var replaceStr = `不足${this.minimumQty_lt}平方米。按${this.minimumQty_lt}平方米下单量收费;`
          if (oneCurtain.DOSAGE < this.minimumQty_lt && oneCurtain.DOSAGE > 0) {
            if (oneCurtain.ILLUSTRATE.indexOf(replaceStr) == -1) {
              oneCurtain.ILLUSTRATE += replaceStr;
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace(replaceStr, '');
          }
        } else if (oneCurtain.NC_PART_TYPECODE == 'LS' || oneCurtain.NC_PART_TYPECODE == 'LCB' || oneCurtain.NC_PART_TYPECODE == 'CS') {
          var replaceStr = `不足${this.minimumQty_ls}平方米。按${this.minimumQty_ls}平方米下单量收费;`
          if (oneCurtain.DOSAGE < this.minimumQty_ls && oneCurtain.DOSAGE > 0) {
            if (oneCurtain.ILLUSTRATE.indexOf(replaceStr) == -1) {
              oneCurtain.ILLUSTRATE += replaceStr;
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace(replaceStr, '');
          }

          //判断是否超高
          var height = this.convertNumber(oneCurtain.HEIGHT);
          var childrenCurtain = allCurtains.filter(item =>
            item.NCM_PID == oneCurtain.NC_MODEL_ID
            && ((oneCurtain.NC_PART_TYPECODE == 'LS' && (item.NC_PART_TYPECODE == 'ZB' || item.NC_PART_TYPECODE == 'PB1' || item.NC_PART_TYPECODE == 'PB2'))
              || (oneCurtain.NC_PART_TYPECODE == 'CS' && (item.NC_PART_TYPECODE == 'ZB' || item.NC_PART_TYPECODE == 'PB')))
          );
          for (var j = 0; j < childrenCurtain.length; j++) {
            var oneChildren = childrenCurtain[j];
            if (height > 2.8 && curtainHeadData.item.FIX_TYPE == '02') {
              if (oneChildren.ILLUSTRATE.indexOf('超高;') == -1) {
                oneChildren.ILLUSTRATE += '超高;';
              }
            } else {
              oneChildren.ILLUSTRATE = oneChildren.ILLUSTRATE.replace('超高;', '');
            }
          }
          if (oneCurtain.NC_PART_TYPECODE == 'LS') {
            //联动里衬
            var lcbCurtain = allCurtains.filter(item => item.NC_PART_TYPECODE == 'LCB');
            if (lcbCurtain.length) {
              lcbCurtain = lcbCurtain[0];
              var lcbChildrenCurtain = allCurtains.filter(item => item.NCM_PID == lcbCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == 'ZB');
              if (lcbChildrenCurtain.length) {
                for (var j = 0; j < lcbChildrenCurtain.length; j++) {
                  var oneChildren = lcbChildrenCurtain[j];
                  if (height > 2.8 && curtainHeadData.item.FIX_TYPE == '02') {
                    if (oneChildren.ILLUSTRATE.indexOf('超高;') == -1) {
                      oneChildren.ILLUSTRATE += '超高;';
                    }
                  } else {
                    oneChildren.ILLUSTRATE = oneChildren.ILLUSTRATE.replace('超高;', '');
                  }
                }
              }
            }
          }
        }
      }
    },
    //找不到图片时
    showDefaultImg(index) {
      this.previewUrlList[index].show = false;
    },
    //替换非标定图片
    updateOrAddPicture(row) {
      this.previewUrlList = this.previewUrlList.filter(item => item.type != 'LK');
      var hasPicture = this.previewUrlList.filter(item => item.type == row.NC_PART_TYPECODE);
      if (hasPicture.length) {
        hasPicture[0].src = `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${row.ITEM_NO}.jpg`;
        hasPicture[0].show = true;
      } else {
        this.previewUrlList.push({
          type: row.NC_PART_TYPECODE,
          src: `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${row.ITEM_NO}.jpg`,
          show: true
        })
        let rule = ["LT", "LS", "CS"];
        this.previewUrlList.sort((a, b) => {
          return rule.indexOf(a.NC_PART_TYPECODE) - rule.indexOf(b.NC_PART_TYPECODE);
        });
      }
    },
    //合并第一列显示预览
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex == 0) {
          return {
            rowspan: this.curtainHeadData.curtains.length,
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
    tableRowClassName({ row, rowIndex }) {
      if (row.curtain_level == 0) {
        if (!row.curtain_choose) return 'bold-row delete-row-cls';
        else return 'bold-row';
      } else {
        if (!row.curtain_choose) return 'fade-row delete-row-cls';
        else return 'fade-row';
      }
      return '';
    },
    closeTable() {
      this.closeToTab({
        oldUrl: "shoppingCar/shoppingNewCurtainEdit",
        newUrl: "shoppingCar/shopping?newCurtain"
      });
    }
  },
  created() {
    this.curtainMsg = this.$route.params.curtain;
    if (!this.curtainMsg || (this.curtainMsg && !this.curtainMsg.cartItemId)) {
      return;
    }
    this.getCurtainParams();
    this.getPartTypeData();
    this.getActivity();
    this.getDetail();
  }
}
</script>

<style scoped>
.curtain-contain {
  margin-top: 10px;
  padding: 5px 0;
  border: 1px solid #eee;
}
.curtain-parent-item {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
.curtain-params {
  text-align: center;
  margin-top: 5px;
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
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}
.a-userset {
  color: #409eff;
  background: 0 0;
  text-decoration: none;
  outline: 0;
  transition: color 0.2s ease;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
.manufacturing-ct {
  margin-bottom: 0;
}
.no-data {
  width: 100%;
  height: 500px;
  text-align: center;
  line-height: 500px;
  font-size: 20px;
}
.model-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
  overflow-x: hidden;
  overflow-y: auto;
}
.model-exchange-list-ct {
  position: absolute;
}
.model-exchange-ct {
  display: inline-block;
  padding: 5px;
  margin: 5px 10px;
  background: #eee;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
}
.model-exchange-ct:hover {
  border: 1px solid #409eff;
}
.model-exchange-now {
  background: #409eff;
}
.model-exchange-inner {
  background-color: white;
  display: flex;
  position: relative;
}
.default-model-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
  writing-mode: tb;
}
.index-badge {
  position: absolute;
  left: 1px;
  top: 3px;
}
.item-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 90px);
  overflow-x: hidden;
  overflow-y: auto;
}
.item-exchange-list-ct {
  position: absolute;
}
.item-exchange-ct {
  padding: 8px 10px 0 10px;
  margin: 5px;
  border-radius: 3px;
  height: 32px;
  border: 1px solid #dcdfe6;
  display: inline-block;
  cursor: pointer;
}
.item-exchange-ct:hover {
  border: 1px solid #000;
}
.item-exchange-now {
  background: #409eff;
}
.item-exchange-now:hover {
  border: 1px solid #dcdfe6;
}
.default-item-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
}
</style>
<style>
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px 0 !important;
}
.curtain-list .el-table .cell {
  padding: 0 2px !important;
  overflow: inherit !important;
}
.curtain-list .el-input__inner {
  padding: 0 5px !important;
  height: 20px !important;
}
.curtain-list .el-textarea__inner {
  padding: 0 5px !important;
}
.curtain-list .el-table .bold-row,
.model-exchange-inner .el-table .bold-row {
  font-weight: bold;
}
.curtain-list .el-table .fade-row,
.model-exchange-inner .el-table .fade-row {
  color: #b0b4bb;
}
.curtain-list .el-table .delete-row-cls {
  color: tomato !important;
  text-decoration: line-through;
  cursor: unset;
}
.index-badge .el-badge__content {
  background: gray;
}
</style>
