<template>
  <span class="zj-count-down">{{formattedTime}}</span>
</template>

<script>
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var _raf = require("../../common/js/raf");

export default {
  props: {
    time: {
      type: [Number, String],
      default: 0
    },
    format: {
      type: String,
      default: 'HH:mm:ss'
    },
    autoStart: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      remain: 0,
      endTime: 0
    }
  },
  computed: {
    timeData: function timeData() {
      return this.parseTimeData(this.remain);
    },
    formattedTime: function formattedTime() {
      return this.parseFormat(this.format, this.timeData);
    }
  },
  watch: {
    time: {
      immediate: true,
      handler() {
        this.reset();
      }
    }
  },
  methods: {
    padZero(num, targetLength) {
      if (targetLength === void 0) {
        targetLength = 2;
      }

      var str = num + '';

      while (str.length < targetLength) {
        str = '0' + str;
      }

      return str;
    },
    parseTimeData(time) {
      var days = Math.floor(time / DAY);
      var hours = Math.floor(time % DAY / HOUR);
      var minutes = Math.floor(time % HOUR / MINUTE);
      var seconds = Math.floor(time % MINUTE / SECOND);
      var milliseconds = Math.floor(time % SECOND);
      return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds
      };
    },
    parseFormat(format, timeData) {
      var days = timeData.days;
      var hours = timeData.hours,
        minutes = timeData.minutes,
        seconds = timeData.seconds,
        milliseconds = timeData.milliseconds;

      if (format.indexOf('DD') === -1) {
        hours += days * 24;
      } else {
        format = format.replace('DD', this.padZero(days));
      }

      if (format.indexOf('HH') === -1) {
        minutes += hours * 60;
      } else {
        format = format.replace('HH', this.padZero(hours));
      }

      if (format.indexOf('mm') === -1) {
        seconds += minutes * 60;
      } else {
        format = format.replace('mm', this.padZero(minutes));
      }

      if (format.indexOf('ss') === -1) {
        milliseconds += seconds * 1000;
      } else {
        format = format.replace('ss', this.padZero(seconds));
      }

      if (format.indexOf('S') !== -1) {
        var ms = this.padZero(milliseconds, 3);

        if (format.indexOf('SSS') !== -1) {
          format = format.replace('SSS', ms);
        } else if (format.indexOf('SS') !== -1) {
          format = format.replace('SS', ms.slice(0, 2));
        } else {
          format = format.replace('S', ms.charAt(0));
        }
      }

      return format;
    },
    start() {
      this.endTime = new Date().getTime() + this.remain;
      this.tick();
    },
    reset() {
      this.remain = +this.time;

      if (this.autoStart) {
        this.start();
      }
    },
    tick() {
      this.rafId = (0, _raf.raf)(() => {
        this.setRemain(this.getRemain());

        if (this.remain > 0) {
          this.tick();
        }
      })
    },
    getRemain() {
      return Math.max(this.endTime - new Date().getTime(), 0);
    },
    setRemain(remain) {
      this.remain = remain;
      this.$emit('change', this.timeData);

      if (remain === 0) {
        this.$emit('finish');
      }
    }
  },
  mounted() {
    this.tick();
  }
}
</script>

<style scoped>
.zj-count-down {
  margin-left: 15px;
  color: #323232;
  font-size: 13px;
}
</style>
