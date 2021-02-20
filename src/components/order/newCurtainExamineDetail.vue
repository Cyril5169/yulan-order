<template>
  <el-card class="centerCard" shadow="hover">
    <div slot="header" :class="{fixHead:isFixed}">
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
    <div slot="header" v-if="isFixed">
      <div style="height:80px;width:100%;"></div>
    </div>
    <!-- 循环订单详情 -->
    <el-table border :data="ruleForm.ORDERBODY" :row-class-name="tableRowClassName" :expand-row-keys="expands"
      :row-key="getRowKeys">
      <el-table-column width="1" type="expand">
        <!-- 窗帘详情 -->
        <template slot-scope="scopeHead">
          <div class="curtain-list">
            <el-table :data="scopeHead.row.curtains" ref="curtainTable" class="curtain-table" border>
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
              <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
                <template slot-scope="scope">
                  <!-- 标定 -->
                  <template v-if="scope.row.ITEM_NO">
                    <!-- 是否可替换 -->
                    <a v-if="scope.row.NCT_CHANGE == 1 && scope.row.NCM_CHANGE == 1" class="a-link"
                      :class="{'delete-cls': !scope.row.curtain_choose}"
                      @click="exchangeModelOrItem(scope.row, scopeHead.$index)">{{scope.row.ITEM_NO}}</a>
                    <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
                    <!-- 是否可删/是否默认勾选 -->
                    <el-checkbox v-if="scope.row.NCT_DELETE > 0 && scope.row.NCM_DELETE > 0" v-model="scope.row.curtain_choose"
                      @change="onCheckChange($event, scope.row, scopeHead.$index)"></el-checkbox>
                  </template>
                  <!-- 没有模板，非标定 -->
                  <template v-else-if="scope.row.curtain_level == 0">
                    <a class="a-link" :class="{'delete-cls': !scope.row.curtain_choose}"
                      @click="exchangeModelOrItem(scope.row, scopeHead.$index)">请选择</a>
                    <el-checkbox v-model="scope.row.curtain_choose" @change="onCheckChange($event, scope.row, scopeHead.$index)">
                    </el-checkbox>
                  </template>
                  <template v-else>
                    <span style="color:red;">未维护数据!</span>
                  </template>
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
                    <template v-if="scope.row.WIDTH_ENABLE == 2">
                      <span>【宽】: <el-input v-model="scope.row.WIDTH" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                      </span>
                    </template>
                    <template v-if="scope.row.HEIGHT_ENABLE == 1">
                      <span>【高】: {{ scope.row.HEIGHT }}m</span>
                    </template>
                    <template v-if="scope.row.HEIGHT_ENABLE == 2">
                      <span>【高】: <el-input v-model="scope.row.HEIGHT" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
                      <span>【左转角】: {{ scope.row.LEFT_FILLET }}m</span>
                    </template>
                    <template v-if="scope.row.LEFT_ENABLE == 2">
                      <span>【左转角】: <el-input v-model="scope.row.LEFT_FILLET" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                      </span>
                    </template>
                    <template v-if="scope.row.RIGHT_ENABLE == 1">
                      <span>【右转角】: {{ scope.row.RIGHT_FILLET }}m</span>
                    </template>
                    <template v-if="scope.row.RIGHT_ENABLE == 2">
                      <span>【右转角】: <el-input v-model="scope.row.RIGHT_FILLET" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
                    <template v-if="scope.row.TIE_ENABLE == 2">
                      <span>【么术贴】: </span>
                      <el-dropdown trigger="click">
                        <a class="a-userset">{{ scope.row.MESUTIE? scope.row.MESUTIE : '请选择' | meshutie_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="scope.row.MESUTIE = 'ZC'">正车</el-dropdown-item>
                          <el-dropdown-item @click.native="scope.row.MESUTIE = 'FC'">反车</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 打开方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                    <template v-if="scope.row.KAIKOU_ENABLE == 1">
                      <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                    </template>
                    <template v-if="scope.row.KAIKOU_ENABLE == 2">
                      <span>【打开方式】: </span>
                      <el-dropdown trigger="click">
                        <a class="a-userset">{{ scope.row.KAIKOU? scope.row.KAIKOU : '请选择' | kaikou_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="scope.row.KAIKOU = 'TK'">对开</el-dropdown-item>
                          <el-dropdown-item @click.native="scope.row.KAIKOU = 'DK'">单开</el-dropdown-item>
                          <el-dropdown-item @click.native="scope.row.KAIKOU = 'SK'">特殊开</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 工艺方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                    <template v-if="scope.row.OPERATION_ENABLE == 1">
                      <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                    </template>
                    <template v-if="scope.row.OPERATION_ENABLE == 2">
                      <span>【工艺方式】: </span>
                      <el-dropdown trigger="click">
                        <a class="a-userset">{{ scope.row.OPERATION? scope.row.OPERATION : '请选择' | operation_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="scope.row.OPERATION = 'GDZ'">固定褶</el-dropdown-item>
                          <el-dropdown-item @click.native="scope.row.OPERATION = 'DQ'">打圈</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 包边方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                    <template v-if="scope.row.BIAN_ENABLE == 1">
                      <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                    </template>
                    <template v-if="scope.row.BIAN_ENABLE == 2">
                      <span>【包边方式】: </span>
                      <el-dropdown trigger="click" @command="handleBianCommand($event, scope.row, scopeHead.$index)">
                        <a class="a-userset">{{ scope.row.BIAN? scope.row.BIAN : '请选择' | bian_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="scope.row.BIAN = '4B'" command="4B">4S边</el-dropdown-item>
                          <el-dropdown-item @click.native="scope.row.BIAN = '3B'" command="3B">3.0边</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 说明 -->
                  <div class="manufacturing-ct"
                    v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                    <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                          v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE">、</template></template>
                      <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                          v-if="scope.row.WRINKLE || scope.row.MAKETYPE">、</template></template>
                      <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                          v-if="scope.row.MAKETYPE">、</template></template>
                      <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="褶数" width="50" align="center" prop="FU_QTY">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.FU_QTY" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="幅数" width="50" align="center" prop="ZE_QTY">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.ZE_QTY" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
                <template slot-scope="scope">
                  <span>
                    <el-input v-model="scope.row.DOSAGE" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                    {{scope.row.UNIT_NAME}}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
              <el-table-column label="单价" width="60" align="center" prop="PRICE">
                <template slot-scope="scope">
                  <!-- 只有部件算钱 -->
                  <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="说明" width="100" align="center" prop="ILLUSTRATE"></el-table-column>
              <el-table-column label="客户备注" align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.NOTE" size="mini" type="textarea" resize="none" :autosize="{ maxRows: 6 }"
                    clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column label="兰居意见" header-align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.SUGGESTION" size="mini" type="textarea" resize="none" :autosize="{ maxRows: 6 }"
                    clearable></el-input>
                </template>
              </el-table-column>
              <el-table-column label="生产备注" header-align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.PRODUCT_NOTE" size="mini" type="textarea" resize="none" :autosize="{ maxRows: 6 }"
                    clearable></el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="LINE_NO" label="序号" width="40"></el-table-column>
      <el-table-column align="center" prop="ITEM_NO" label="款号" width="100"></el-table-column>
      <el-table-column align="center" prop="BRAND_NAME" label="品牌" width="90"></el-table-column>
      <el-table-column align="center" prop="TYPE_NAME" label="类型" width="90"></el-table-column>
      <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="90"></el-table-column>
      <el-table-column label="销售状态" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.SALE_ID | transSaleId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="CURTAIN_WIDTH" label="成品宽" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_HEIGHT" label="成品高" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_ROOM_NAME" label="位置" width="100"></el-table-column>
      <el-table-column align="center" prop="QTY_REQUIRED" label="套数" width="70"></el-table-column>
      <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
      <el-table-column label="总价" align="center" width="130">
        <template slot-scope="scope">
          <span>{{
                    (scope.row.UNIT_PRICE * scope.row.QTY_REQUIRED)
                      | dosageFilter
                  }}</span>
          <span v-if="dosageFilter(allTotal(scope.$index)) != scope.row.UNIT_PRICE"
            style="color:red;">({{allTotal(scope.$index) | dosageFilter}})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
    </el-table>
    <!-- 底部 -->
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

    <!-- 替换组件 -->
    <el-drawer :title='"【" + transPartTypeCode(exchangeModelTemplate.NC_PART_TYPECODE) + "】" + "可替换列表"' :visible.sync="drawerShow"
      :with-header="false" :size="isManager!='0'?'730px':'670px'">
      <span style="color:grey;margin-left:10px;">*单击选择</span>
      <div class="model-exchange-list">
        <div class="model-exchange-list-ct">
          <div v-for="(item, index) in exchangeModelList" :key="index" class="model-exchange-ct"
            :class="{'model-exchange-now': item.NC_MODEL_ID == exchangeModelNow.NC_MODEL_ID }" @click="onChangeModelClick(item)">
            <div class="model-exchange-inner">
              <el-table :data="item.curtain_model" border :style="{width: isManager!='0'?'670px':'610px'}">
                <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                  <template slot-scope="scope">
                    <!-- 树缩进 -->
                    <span v-if="scope.row.curtain_level > 0">
                      <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                    </span>
                    <span
                      :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
                </el-table-column>
                <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
                </el-table-column>
                <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
                <el-table-column label="单价" width="60" align="center" prop="curtain_price">
                  <template slot-scope="scope">
                    <!-- 只有部件算钱 -->
                    <span v-if="scope.row.curtain_level == 0">{{scope.row.curtain_price}}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="说明" header-align="center" prop="NOTE">
                  <template slot-scope="scope">
                    <template v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_MAKETYPE">、</template></template>
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
        <el-input clearable v-model.trim="itemCondition" @clear="getExangeItemList" size="small"
          @keyup.enter.native="getExangeItemList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExangeItemList" slot="append" icon="el-icon-search">搜索</el-button>
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
      <el-pagination class="tc mt10" @current-change="getExangeItemList" :current-page.sync="currentPage" :page-size="limit"
        layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-drawer>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { mapActions } from "vuex";
import Axios from "axios";
import {
  getOrderDetails,
  updateCurtainOrder,
  getOperationRecord,
  getCustomerInfo,
} from "@/api/orderListASP";
import {
  GetPartTypeDataTabale, GetExchangeModel,
  GetExchangeModelItem,
} from "@/api/newCurtainASP";

export default {
  data() {
    return {
      isManager: "1",
      customerType: Cookies.get("customerType"),
      cus_customerType: "",
      orderNumber: '',
      operationRecords: [],
      expands: [],
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: [],
      },
      isFixed: false,
      curtainPartTypeData: [],
      drawerShow: false,
      drawerShow2: false,
      exchangeModelList: [],
      exchangeModelTemplate: {},
      exchangeModelNow: {},
      exchangeItemList: [],
      exchangeItemNow: [],
      exchangeItemDefault: {},
      itemCondition: "",
      currentPage: 0,
      limit: 50,
      totalNumber: 0,
      currentIndex: -1,
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
    ...mapActions("navTabs", ["closeToTab"]),
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTabale().then((res) => {
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter((item) => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    allTotal(index) {
      let totalMoney = 0;
      for (var i = 0; i < this.ruleForm.ORDERBODY[index].curtains.length; i++) {
        var curtain = this.ruleForm.ORDERBODY[index].curtains[i];
        totalMoney += curtain.PRICE.mul(curtain.DOSAGE);
      }
      return totalMoney;
    },
    getRowKeys(row) {
      return row.LINE_NO;
    },
    getCustomer() {
      var data = {
        cid: this.ruleForm.CUSTOMER_CODE,
        companyId: this.ruleForm.CUSTOMER_CODE,
      };
      getCustomerInfo(data, { loading: false }).then((res) => {
        this.cus_customerType = res.data.CUSTOMER_TYPE;
      });
    },
    getDetail() {
      getOrderDetails({ orderNo: this.orderNumber }).then((res) => {
        this.ruleForm = res.data[0];
        this.getCustomer();
        for (let i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
          this.ruleForm.ORDERBODY[i].checkStatus = "未修改";
          this.expands.push(this.ruleForm.ORDERBODY[i].LINE_NO);
        }
        this.dealCurtainData();
        getOperationRecord({ orderNo: this.orderNumber }, { loading: false }).then((res) => {
          this.operationRecords = res.data;
        });
      });
    },
    dealCurtainData() {
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var detail = this.ruleForm.ORDERBODY[i];
        for (var j = 0; j < detail.curtains.length; j++) {
          var oneCurtain = detail.curtains[j];
          //窗帘层级
          var level = 0;
          var NCM_PID = oneCurtain.NCM_PID;
          while (NCM_PID != 0) {
            var temp = detail.curtains.filter((item) => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
          this.$set(detail.curtains[j], "curtain_level", level);
          //选中标识(这里既然有那肯定都是选中的)
          this.$set(detail.curtains[j], "curtain_choose", true);
          //库存
          this.$set(detail.curtains[j], "curtain_store", "");
        }
        detail.curtains = this.getStoreData(detail.curtains);
        //change
        for (var j = 0; j < detail.curtain_change.length; j++) {
          var oneCurtain = detail.curtain_change[j];
          //窗帘层级
          var level = 0;
          var NCM_PID = oneCurtain.NCM_PID;
          while (NCM_PID != 0) {
            var temp = detail.curtain_change.filter((item) => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
          this.$set(detail.curtain_change[j], "curtain_level", level);
          //选中标识
          this.$set(detail.curtain_change[j], "curtain_choose", true);
          //单价
          var price = this.getPrice(this.cus_customerType, detail.curtain_change[j]);
          this.$set(detail.curtain_change[j], "curtain_price", price);
          //宽
          var curtain_width = 0;
          if (detail.curtain_change[j].WIDTH_ENABLE > 0) {
            curtain_width = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_WIDTH * detail.curtain_change[j].NCM_WIDTH_RATIO);
          }
          this.$set(detail.curtain_change[j], "curtain_width", curtain_width);
          //高
          var curtain_height = 0;
          if (detail.curtain_change[j].HEIGHT_ENABLE > 0) {
            curtain_height = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_HEIGHT * detail.curtain_change[j].NCM_HEIGHT_RATIO);
          }
          //总数（面积）
          var area = this.dosageFilter(curtain_width * curtain_height);
          if (detail.curtain_change[j].NC_PART_TYPECODE == "GBD") area = 1; //挂绑带默认为1
          this.$set(detail.curtain_change[j], "curtain_area", area);
          if (detail.curtain_change[j].NC_PART_TYPECODE == "LS") {
            //改变里衬布的
            var LCBITEM = detail.curtain_change.filter((item) => item.NC_PART_TYPECODE == "LCB");
            for (var k = 0; k < LCBITEM.length; k++) {
              //假设有多个里衬布的情况
              LCBITEM[k].curtain_area = area;
            }
          }
          //左转角
          this.$set(detail.curtain_change[j], "curtain_left_fillet", 0);
          //右转角
          this.$set(detail.curtain_change[j], "curtain_right_fillet", 0);
          //库存
          this.$set(detail.curtain_change[j], "curtain_store", "");
          //客户备注
          this.$set(detail.curtain_change[j], "curtain_note", "");
          //说明
          this.$set(detail.curtain_change[j], "curtain_remark", "");
        }
        detail.curtain_change = this.getStoreData(detail.curtain_change);
      }
    },
    //把model数据转换为comodity数据
    dealInsertData(data) {
      var returnData = {
        ...data,
        PRICE: data.curtain_price,
        ITEM_ID: data.ITEM_NO,
        WIDTH: data.curtain_width,
        HEIGHT: data.curtain_height,
        NOTE: "",
        UNIT: data.UNIT_NAME,
        CURTAIN_ITEM_NAME: data.NOTE,
        CURTAIN_PART_NAME: this.transPartTypeCode(data.NC_PART_TYPECODE),
        DOSAGE: data.curtain_area,
        ILLUSTRATE: data.curtain_remark,
        INLINE_NO: 0,
        KAIKOU: data.NCM_KAIKOU,
        OPERATION: data.NCM_OPERATION,
        BIAN: data.NCM_BIAN,
        JOINT: data.NCM_JOINT,
        WRINKLE: data.NCM_WRINKLE,
        MAKETYPE: data.NCM_MAKETYPE,
        MESUTIE: data.NCM_MESUTIE,
        LEFT_FILLET: data.curtain_left_fillet,
        RIGHT_FILLET: data.curtain_right_fillet,
      }
      return returnData;
    },
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        if (!originData[i].ITEM_NO) continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: originData[i].ITEM_NO,
        };
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var store_charge = "";
            if (res.data.data.kucun == null || res.data.data.dinghuoshu == null
              || res.data.data.ddz == null || res.data.data.xiaxian == null)
              return;
            var store_num = res.data.data.kucun - res.data.data.dinghuoshu - res.data.data.ddz;
            var xiaxian = res.data.data.xiaxian;
            if (store_num >= xiaxian) {
              store_charge = "充足"
            } else if (store_num > 0 && store_num < xiaxian) {
              store_charge = "量少待查";
            } else if (store_num < 0) {
              store_charge = "欠料待审";
            }
            var data = originData.filter((item) => item.ITEM_NO == res.data.data.code);
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
    //改变单个宽或者高
    changeOneWidthOrHeight(val, index1, index) {
      var oneCurtain = this.ruleForm.ORDERBODY[index].curtains[index1];
      oneCurtain.DOSAGE = this.dosageFilter(oneCurtain.WIDTH * oneCurtain.HEIGHT);
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
        }
      }
    },
    //处理拉边条
    handleBianCommand(common, row, index) {
      if (common == "4B" && row.BIAN != "4B") {
        //显示拉边条
        //先看看当前数据有没有这个拉边条，有的话应该是bug
        var lbtItemNow = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        if (lbtItemNow.length) return;
        //找到最大序号的面料,并且是要勾选的
        var mlList = this.ruleForm.ORDERBODY[index].curtains.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID &&
            item.NC_PART_TYPECODE != "LBT" &&
            item.curtain_choose
        );
        if (mlList.length) {
          //在修改后的数据中找到拉边条数据并push进去
          var lbtItem = this.ruleForm.ORDERBODY[index].curtain_change.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            lbtItem = this.dealInsertData(lbtItem);
            this.ruleForm.ORDERBODY[index].curtains.push({ ...lbtItem });
            //强制改成对应的ITEM_NO
            this.ruleForm.ORDERBODY[index].curtains[this.ruleForm.ORDERBODY[index].curtains.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
            //排序
            this.ruleForm.ORDERBODY[index].curtains.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
          }
        }
      } else if (common == "3B" && row.BIAN == "4B") {
        //去掉拉边条
        //找到有没有拉边条
        var lbtItem = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        //应该只有一个拉边条，但是循环一下，保险
        for (var i = 0; i < lbtItem.length; i++) {
          this.ruleForm.ORDERBODY[index].curtains.splice(this.ruleForm.ORDERBODY[index].curtains.indexOf(lbtItem[i]), 1);
        }
      }
    },
    //勾选的联动处理
    onCheckChange(checked, row, index) {
      if (!row.ITEM_NO) return;
      var childrenCurtain = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NC_MODEL_ID);
      var fatherCurtain = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NC_MODEL_ID == row.NCM_PID);
      if (childrenCurtain.length) {
        //自身作为父节点，勾选或者取消，子节点应该同步
        for (var i = 0; i < childrenCurtain.length; i++) {
          childrenCurtain[i].curtain_choose = checked;
          //往下更新需要联动，往上更新不需要
          this.onCheckChange(checked, childrenCurtain[i], index);
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
            var mlList = this.ruleForm.ORDERBODY[index].curtains.filter((item) =>
              item.NCM_PID == row.NCM_PID &&
              item.NC_PART_TYPECODE != "LBT" &&
              item.curtain_choose
            );
            if (mlList.length && mlList[mlList.length - 1].ITEM_NO == row.ITEM_NO) {
              //先看看当前数据有没有拉边条，有的话应该是全选的时候这一条还没勾选上的时候上一条数据加载的
              var lbtItemNow = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
              if (lbtItemNow.length == 0) {
                //在修改后的数据中找到拉边条数据并push进去
                var lbtItem = this.ruleForm.ORDERBODY[index].curtain_change.filter((item) =>
                  item.NCM_PID == row.NCM_PID &&
                  item.NC_PART_TYPECODE == "LBT"
                );
                if (lbtItem.length) {
                  lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
                  lbtItem = this.dealInsertData(lbtItem)
                  this.ruleForm.ORDERBODY[index].curtains.push({ ...lbtItem });
                  //强制改成对应的ITEM_NO
                  this.ruleForm.ORDERBODY[index].curtains[this.ruleForm.ORDERBODY[index].curtains.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
                  //排序
                  this.ruleForm.ORDERBODY[index].curtains.sort((a, b) => {
                    if (a.NCT_SORTNO == b.NCT_SORTNO) {
                      return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
                    }
                    return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
                  });
                }
              } else {
                //有的话直接更新
                lbtItemNow[0].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
              }
            }
          }
        } else {
          //取消勾选删掉对应的拉边条，并找有没有其他
          //从父节点看是否需要删除
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.BIAN == "4B") {
            var lbtItem = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
            if (lbtItem.length) {
              //继续找到最大的面料对应的拉边条
              var mlList = this.ruleForm.ORDERBODY[index].curtains.filter((item) =>
                item.NCM_PID == row.NCM_PID &&
                item.NC_PART_TYPECODE != "LBT" &&
                item.curtain_choose
              );
              if (mlList.length) {
                //有的话更新拉边条
                lbtItem[0].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
              } else {
                //没有的话删除拉边条
                for (var i = 0; i < lbtItem.length; i++) {
                  this.ruleForm.ORDERBODY[index].curtains.splice(this.ruleForm.ORDERBODY[index].curtains.indexOf(lbtItem[i]), 1);
                }
              }
            }
          }
          //子节点取消勾选，如果同级没有其他勾选了，父节点取消勾选
          var brotherCurtain = this.ruleForm.ORDERBODY[index].curtains.filter((item) => item.NCM_PID == row.NCM_PID && item.curtain_choose);
          if (brotherCurtain.length == 0)
            fatherCurtain.curtain_choose = checked;
        }
      }
    },
    //点击显示可替换列表
    exchangeModelOrItem(row, index) {
      this.currentIndex = index;
      if (!row.curtain_choose) return;
      if (row.curtain_level == 0) {
        //整个组件替换
        this.exchangeModelNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeModelList();
      } else {
        //子件替换
        this.exchangeItemNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExangeItemList();
      }
    },
    //获得可替换组件列表
    getExchangeModelList() {
      this.exchangeModelList = [];
      GetExchangeModel({
        NC_TEMPLATE_ID: this.exchangeModelNow.NC_TEMPLATE_ID,
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].NC_MODEL_ID != this.exchangeModelNow.NC_MODEL_ID)) {
          this.exchangeModelList = res.data;
          //默认数据
          var defaultModel = this.ruleForm.ORDERBODY[this.currentIndex].curtain_template.filter((item) =>
            item.NC_TEMPLATE_ID == this.exchangeModelNow.NC_TEMPLATE_ID);
          if (defaultModel.length) {
            this.exchangeModelTemplate = defaultModel[0];
          }
          //添加层级数据
          for (var i = 0; i < this.exchangeModelList.length; i++) {
            var curtain_list = this.exchangeModelList[i].curtain_model;
            for (var j = 0; j < curtain_list.length; j++) {
              var level = 0;
              var NCM_PID = curtain_list[j].NCM_PID;
              while (NCM_PID != 0) {
                var temp = curtain_list.filter((item) => item.NC_MODEL_ID == NCM_PID);
                if (temp.length) {
                  NCM_PID = temp[0].NCM_PID;
                  level++;
                }
              }
              this.$set(curtain_list[j], "curtain_level", level);
              //单价
              var price = this.getPrice(this.cus_customerType, curtain_list[j]);
              this.$set(curtain_list[j], "curtain_price", price);
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
      var selectModel = model.curtain_model.filter((item) => item.NC_MODEL_ID == model.NC_MODEL_ID);
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
          this.ruleForm.ORDERBODY[this.currentIndex].curtains = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter((item) =>
            item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          this.ruleForm.ORDERBODY[this.currentIndex].curtain_change = this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.filter((item) =>
            item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          //第二步，把当前选中的push进去
          var curtain_temp = this.getOtherCurtainMsgForExchange(model.curtain_model);
          for (var i = 0; i < curtain_temp.length; i++) {
            curtain_temp[i] = this.dealInsertData(curtain_temp[i]);
            var oneCurtain = curtain_temp[i];
            if (oneCurtain.NC_PART_TYPECODE == "LBT") {
              //先看父节点需不需要加载出拉边条
              var fatherCurtain = curtain_temp.filter((item) =>
                item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                item.BIAN_ENABLE > 0 &&
                item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //如果需要加载，看排序最大的面料对应的拉边条,并且是要勾选的
                var mlList = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter((item) =>
                  item.NCM_PID == oneCurtain.NCM_PID &&
                  item.NC_PART_TYPECODE != "LBT" &&
                  item.curtain_choose
                );
                if (mlList.length) {
                  this.ruleForm.ORDERBODY[this.currentIndex].curtains.push({ ...oneCurtain });
                  this.ruleForm.ORDERBODY[this.currentIndex].curtains[this.ruleForm.ORDERBODY[this.currentIndex].curtains.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
                }
              }
            } else {
              this.ruleForm.ORDERBODY[this.currentIndex].curtains.push({ ...oneCurtain });
            }
          }
          this.ruleForm.ORDERBODY[this.currentIndex].curtains.sort((a, b) => {
            if (a.NCT_SORTNO == b.NCT_SORTNO) {
              return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
            }
            return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
          });
          this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.push(...curtain_temp);
          this.drawerShow = false;
        })
          .catch(() => { });
      }
    },
    //添加其他没有的数据
    getOtherCurtainMsgForExchange(originData) {
      for (var i = 0; i < originData.length; i++) {
        //选中标识(父节点以部件为准，子节点综合父节点考虑)
        var defaultChose = originData[i].NCT_DELETE < 2 && originData[i].NCM_DELETE < 2;
        this.$set(originData[i], "curtain_choose", defaultChose);
        //宽
        var curtain_width = 0;
        if (originData[i].WIDTH_ENABLE > 0) {
          curtain_width = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_WIDTH * originData[i].NCM_WIDTH_RATIO);
        }
        this.$set(originData[i], "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (originData[i].HEIGHT_ENABLE > 0) {
          curtain_height = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_HEIGHT * originData[i].NCM_HEIGHT_RATIO);
        }
        this.$set(originData[i], "curtain_height", curtain_height);
        //总数（面积）
        var area = this.dosageFilter(curtain_width * curtain_height);
        if (originData[i].NC_PART_TYPECODE == "GBD") area = 1; //挂绑带默认为1
        this.$set(originData[i], "curtain_area", area);
        if (originData[i].NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = originData.filter((item) => item.NC_PART_TYPECODE == "LCB");
          for (var j = 0; j < LCBITEM.length; j++) {
            //假设有多个里衬布的情况
            LCBITEM[j].curtain_area = area;
          }
        }
        //左转角
        this.$set(originData[i], "curtain_left_fillet", 0);
        //右转角
        this.$set(originData[i], "curtain_right_fillet", 0);
        //客户备注
        this.$set(originData[i], "curtain_note", "");
        //说明
        this.$set(originData[i], "curtain_remark", "");
      }
      return originData;
    },
    //获得可替换子件列表
    getExangeItemList() {
      this.exchangeItemList = [];
      GetExchangeModelItem({
        NC_MODEL_ID: this.exchangeItemNow.NC_MODEL_ID,
        condition: this.itemCondition,
        page: this.currentPage,
        limit: this.limit,
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].ITEM_NO != this.exchangeItemNow.ITEM_NO)) {
          this.exchangeItemList = res.data;
          this.totalNumber = res.count;
          //默认物料(从替换后的找)
          var defaultItem = this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.filter((item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
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
        //替换只是更换item，现在只需要替换字段ITEM_NO，NOTE和拉边条MATERIAL_NO
        var originItem = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter((item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
        if (originItem.length) {
          originItem = originItem[0];
          originItem.ITEM_NO = item.ITEM_NO;
          originItem.NOTE = item.NOTE;
          originItem.MATERIAL_NO = item.MATERIAL_NO;
        }
        //替换拉边条
        //如果需要加载，看自身是不是勾选中排序最大的
        var mlList = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter((item) =>
          item.NCM_PID == originItem.NCM_PID &&
          item.NC_PART_TYPECODE != "LBT" &&
          item.curtain_choose
        );
        if (mlList.length && mlList[mlList.length - 1].ITEM_NO == originItem.ITEM_NO) {
          //改变拉边条数据
          var lbtItem = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter((item) =>
            item.NCM_PID == originItem.NCM_PID &&
            item.NC_PART_TYPECODE == "LBT"
          );
          if (lbtItem.length) {
            lbtItem[0].ITEM_NO = originItem.MATERIAL_NO;
          }
        }
        //更新库存
        this.ruleForm.ORDERBODY[this.currentIndex].curtains = this.getStoreData(this.ruleForm.ORDERBODY[this.currentIndex].curtains);
        this.drawerShow2 = false;
      })
        .catch(() => { });
    },
    //隔行变色
    tableRowClassName({ row, rowIndex }) {
      return "success-row";
    },
    handleScroll() {
      this.$nextTick(() => {
        let main = document.getElementById("mainBackTop");
        let scrollTop = main.scrollTop;
        if (scrollTop > 110) {
          this.isFixed = true;
        } else {
          this.isFixed = false;
        }
      });
    },
  },
  mounted() {
    this.orderNumber = Cookies.get("NEW_ORDER_NO");
    this.getPartTypeData();
    this.getDetail();

    window.addEventListener("scroll", this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
}
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
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
.fixHead {
  position: fixed;
  top: 81px;
  z-index: 100;
  background: white;
  width: 100%;
}
.a-link {
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
  height: calc(100% - 30px);
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
  cursor: pointer;
  box-sizing: border-box;
}
.model-exchange-ct:hover {
  border: 1px solid #409eff;
}
.model-exchange-now {
  background: #409eff;
}
.model-exchange-now:hover {
  border: none;
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
.centerCard .el-icon-arrow-right:before {
  content: "";
}
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px 0 !important;
}
.curtain-list .el-table .cell {
  padding: 0 2px !important;
}
.curtain-list .el-input__inner {
  padding: 0 5px;
  height: 20px;
}
.index-badge .el-badge__content {
  background: gray;
}
</style>
