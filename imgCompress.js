/**
 * Created by erlin.chen on 2018/3/12.
 */
(function (window) {

    /**
     * 作者: 二木
     *
     * 日期：2018-03-12
     *
     * 插件功能：压缩图片&返回二进制（Blob）图片元素数据组成的列表
     */
    window.emImgCompress = function () {

        var blobList = [], //压缩后的二进制图片数据列表
            canvas = document.createElement('canvas'), //用于压缩图片的canvas
            ctx = canvas.getContext('2d'),
            file_type = 'image/jpeg', //图片类型
            qlty = 0.5, //图片压缩品质，默认是0.5，可选范围是0-1的数字类型的值，可配置
            imgWH = 1000; //压缩后的图片的最大宽度和高度，默认是1000px,可配置


        /**
         * 功能：压缩图片&&返回二进制（blob）图片数据
         * @param fileList，文件列表对象
         * @param getBlobList，获取压缩结果的钩子函数
         * @param quality，传入函数的图片压缩比率（品质），可选范围0-1的数字类型值，默认为0.5
         * @param WH，最大图片宽和高尺寸，默认为1000px
         */
        function process (fileList, getBlobList, quality, WH) {
            blobList = [];//初始化

            //判断fileList的长度是否大于0
            if (!fileList.length) {
                console.log('警告：传进方法process的参数fileList长度必须大于零！！！');
                return;
            }

            //如果quality参数有值，则把quality赋值给qlty（图片压缩的品质）
            if (quality) {
                qlty = quality;
            }

            //如果WH参数有值，则把赋值给imgWH（压缩后的图片最大宽度和高度）
            if (WH && WH < 1000 && WH >0) {
                imgWH = WH;
            }

            //将类数组对象转为数组类型
            var files = Array.prototype.slice.call(fileList);

            files.forEach(function (file, i) {
                //校验格式
                if (!/\/(?:jpeg|png)/i.test(file.type)) {
                    console.log('警告：图片必须是jpeg||png类型！！！');
                    return;
                }

                //获取压缩前图片大小，并打印
                var size = file.size/1024 > 1024 ? (~~(10*file.size/1024/1024))/10 + 'MB' : ~~(file.size/1024) + 'KB';
                    console.log('size:', size);

                var reader = new FileReader();
                
                reader.onload = function () {
                    var img = new Image();
                    img.src = this.result;

                    //图片加载完毕后进行压缩
                    if (img.complete) {
                        callback();
                    } else {
                        img.onload = callback;
                    }
                    
                    function callback() {
                        //获取压缩后的图片二进制数据
                        var data = getImgCompress(img);

                        //将二进制数据塞入到blobList中
                        blobList.push(data);

                        if (blobList.length === files.length) {
                            if (getBlobList) {
                                getBlobList(blobList);
                            }
                        }
                    }
                }

                reader.readAsDataURL(file);
            });
        }


        /**
         *压缩图片对象函数
         * @param img
         * @returns {Blob|*},返回二进制图片数据
         */
        function getImgCompress(img) {
            //获取原图宽度与高度
            var width = img.width;
            var height = img.height;

            if (width>imgWH || height>imgWH) {
                var ratio = ~~(height/width*10)/10;
                if (width>height) {
                    width = imgWH;
                    height = imgWH * ratio;
                } else {
                    height = imgWH;
                    width = imgWH / ratio;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // 铺底色
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, width, height);

            //绘制图片
            ctx.drawImage(img, 0, 0 ,width, height);

            var ndata;

            ndata = canvas.toDataURL(file_type, qlty);

            //打印压缩前后的大小，以及压缩比率
            var initSize = img.src.length;
            console.log('压缩前：' + initSize);
            console.log('压缩后：' + ndata.length, 'base64数据', ndata);
            console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");

            //将压缩后的base64数据转为二进制数据
            ndata = dataURItoBlob(ndata);

            //清除canvas画布的宽高
            canvas.width = canvas.height = 0;

            return ndata;
        }


        /**
         *base64（dataURI） to blob
         * @param dataURI
         * @returns {Blob}
         */
        function dataURItoBlob(dataURI) {
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i =0; i<byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], {type: mimeString});
        }


        /**
         * 返回一个process方法
         */
        return process;
    };

})(window);
