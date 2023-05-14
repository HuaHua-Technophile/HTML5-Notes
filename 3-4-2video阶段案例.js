function getFormatTime(time) {
  return `${parseInt(time / 3600)
    .toString()
    .padStart(2, "0")}:${parseInt((time % 3600) / 60)
    .toString()
    .padStart(2, "0")}:${parseInt(time % 60)
    .toString()
    .padStart(2, "0")}`;
} //封装一个获取时分秒的函数
function throttle(func, delay) {
  let previous = 0; // 定义记录上一次执行时间的变量,初始值为0
  return function () {
    let now = Date.now(), // 获取当前时间
      context = this, // 保存函数调用上下文环境
      args = arguments; // 保存函数调用参数对象
    if (now - previous > delay) {
      // 如果当前时间和上一次执行时间的差值大于设定的时间间隔
      func.apply(context, args); // 执行函数
      previous = now; // 更新上一次执行时间
    }
  };
} //封装一个获取节流函数
V.oncanplay = function () {
  //当视频加载完毕可播放时
  this.style.display = "block"; //显示视频
  totalTime.innerHTML = getFormatTime(this.duration); //JavaScript中的video对象表示一个HTML <video> 元素，它有一个duration属性，可以返回视频的长度，单位是秒
};
PlayBtn.onclick = function () {
  V.paused ? V.play() : V.pause(); //如果是暂停,就播放.否则就暂停
  this.classList.toggle("Play"); // toggle方法是元素的classList属性的一个方法，它可以接受一个类名作为参数，然后检查元素是否已经有这个类名。如果有，就移除它；如果没有，就添加它。
};
V.ontimeupdate = function () {
  // video对象的ontimeupdate属性或事件可以在视频的当前播放位置发生改变时触发一个脚本或函数
  let currentTime = this.currentTime, //video对象的currentTime属性用于设置或返回视频播放的当前位置（以秒为单位的数值类型）
    duration = this.duration; //总时间
  let percent = (currentTime / duration) * 100 + "%"; //百分比
  loaded.style.width = percent; //修改进度条宽度
  currPlayTime.innerHTML = getFormatTime(currentTime); //修改当前播放进度的时间
};
progress.onclick = function (event) {
  // 进度条跳跃播放
  event = event || window.event;
  V.currentTime = (event.offsetX / this.offsetWidth) * V.duration; //设置视频时间跳跃至=>播放百分比*总时长
};
Full_screen.onclick = function () {
  V.requestFullscreen() || V.webkitEnterFullScreen();
};
$.ajax({
  url: "./3-4-2前前前世 (Movie ver_) - RADWIMPS.lrc",
  success: function (data) {
    let arrary = data.split("\n");
    for (i = 0; i < 6; i++) {
      arrary.shift(); /*删掉开头6个脏数据*/
    }
    let medisArray = [];
    $.each(arrary, function (index, item) {
      // 遍历arrary，并且将时间和文字拆分开，并push进自己定义的数组，形成一个对象数组
      let timestr = item.substring(item.indexOf("[") + 1, item.indexOf("]"));
      medisArray.push({
        time: (
          timestr.split(":")[0] * 60 +
          parseFloat(timestr.split(":")[1])
        ).toFixed(3),
        lrc: item.substring(item.indexOf("]") + 1),
      });
    });
    let ul = $("#Lyrics>ul");
    // 遍历medisArray，并且生成li标签，将数组内的文字放入li标签
    $.each(medisArray, function (index, item) {
      let li = $("<li>");
      ul.append(li); /*加入页面*/
      li.html(item.lrc);
      li.attr("data-time", item.time);
      li.attr("data-top", li[0].offsetTop);
      li.click(function () {
        // 点击li标签时，播放对应的音乐
        $("#audio")[0].currentTime = li.attr("data-time");
      });
    });
  },
});
$("#audio").on(
  "timeupdate",
  throttle(function () {
    let currentTime = this.currentTime;

    $("#Lyrics>ul>li").each(function () {
      if (currentTime > $(this).attr("data-time")) {
        $(this).addClass("play").siblings().removeClass("play");
        $("#Lyrics")[0].scrollTo({
          top:
            Number($(this).attr("data-top")) - $("#Lyrics")[0].offsetHeight / 2,
          behavior: "smooth" /*平滑滚动*/,
        });
      }
    });
  }, 500) //函数节流
);

/* $.ajax({
  url: "/music/music.txt",
  type: "get",
  success: function (data) {
    data = jQuery.parseJSON(data);
    var length = data.length;
    var now = 0;
    for (i = 0; i < length; i++) {
      $("#musicText li")
        .eq(i)
        .after("<li>" + data[i].text + "</li>");
    }
    var player = {
      playButton: $(".play"),
      songText: $(".musicText"),
      state: 0,
      //0播放，1暂停
      audio: $("#audio").get(0),
      bind: function () {
        //绑定按钮
        //播放或暂停
        console.log($.type(this));
        console.log($.type(this));
        var obj = this;
        this.playButton.click(function () {
          obj.changeState(obj.state ? 0 : 1);
        });
        //设置声音
        $("#voice").click(function (ex) {
          var percent = (ex.clientX - $(this).offset().left) / $(this).width();
          obj.setVoice(percent);
        });
        //默认声音 0.8
        obj.setVoice(1.0);
        //静音
        $("#voiceOP").click(function () {
          if (obj.muted) {
            $(this).removeClass("muted");
            obj.audio.muted = false;
            obj.muted = false;
          } else {
            $(this).addClass("muted");
            obj.audio.muted = true;
            obj.muted = true;
          }
        });
        //设置进度
        $("#MusicProgress").click(function (ex) {
          var percent = (ex.clientX - $(this).offset().left) / $(this).width();
          obj.setProgress(percent, false);
        });
        //上一首
        $("#prev").click(function () {
          obj.nowIndex--;
          if (obj.nowIndex < 0) obj.nowIndex = obj.list.length - 1;
          obj.playSing(obj.nowIndex);
        });
        //下一首
        $("#next").click(function () {
          obj.nowIndex++;
          if (obj.nowIndex >= obj.list.length) obj.nowIndex = 0;
          obj.playSing(obj.nowIndex);
          player.audio.play();
        });
        //绑定事件 - 播放时间改变
        this.audio.ontimeupdate = function () {
          obj.timeChange();
        };
        //播放结束
        this.audio.onended = function () {
          obj.singEnd();
        };
      },
      //切换播放状态
      changeState: function (_state) {
        this.state = _state;
        if (!this.state) {
          this.playButton.removeClass("pause").addClass("play");
          this.pause();
        } else {
          this.playButton.removeClass("play").addClass("pause");
          this.play();
        }
      },
      //播放
      play: function () {
        this.audio.play();
      },
      //暂停
      pause: function () {
        this.audio.pause();
      },
      timeChange: function () {
        var nowSec = Math.floor(this.audio.currentTime);
        console.log(nowSec);
        console.log(data[now].time);
        if (nowSec > data[now].time) {
          now = now + 1;
          console.log(now);
          $("#musicText li")
            .eq(now)
            .addClass("active")
            .siblings("li")
            .removeClass("active");
          $("#musicText").css("top", -(24 * now) + 138);
        }
        var totalSec = Math.floor(this.audio.duration);
        //当前进度显示
        var secTip = secFormat(nowSec) + "/" + secFormat(totalSec);
        if (secTip.length == 11) $("#secTip").html(secTip);
        this.setProgress(nowSec / totalSec, true);
      },
      setVoice: function (percent) {
        $("#voice")
          .children(".bar")
          .css("width", percent * 100 + "%");
        $("#voice")
          .children("a")
          .css("left", percent * 100 + "%");
        this.audio.volume = percent;
      },
      setProgress: function (percent, justCss) {
        $("#MusicProgress")
          .children(".bar")
          .css("width", percent * 100 + "%");
        $("#MusicProgress")
          .children("a")
          .css("left", percent * 100 + "%");
        if (!justCss) this.audio.currentTime = this.audio.duration * percent;
      },
      singEnd: function () {
        if (this.style == 0) {
          this.nowIndex++;
          if (this.nowIndex >= this.list.length) this.nowIndex = 0;
          this.playSing(this.nowIndex);
        } else {
          var index = Math.floor(Math.random() * (this.list.length + 1)) - 1;
          index = index < 0 ? 0 : index;
          index = index >= this.list.length ? this.list.length - 1 : index;
          this.playSing(index);
          this.nowIndex = index;
        }
      },
    };
    player.bind();
    function secFormat(num) {
      var m = Math.floor(num / 60);
      var s = Math.floor(num % 60);
      return makeFormat(m) + ":" + makeFormat(s);
      function makeFormat(n) {
        if (n >= 10) return n;
        else {
          return "0" + n;
        }
      }
    }
  },
}); */
