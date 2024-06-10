
var scaleFactor = 10.0;
var originalBoardSize = {
    height: 21000,
    width: 29700
};
var oldPos = { 'x': 0, 'y': 0 };
var boardOffset = { 'x': 0, 'y': 0 };
var scrollingTheView = false;

var ZOOM_EXPONENT = 1.1;



var poly = null
function ckSvg(e) {
    const svg = document.querySelector('svg');
    e = e || window.event; //window.event for IE
    if (e.button == 0) {

        let pt = new DOMPoint(event.clientX, event.clientY);
        pt = pt.matrixTransform(svg.getScreenCTM().inverse());

        if (!poly) {
            poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
            svg.appendChild(poly)
        }
        p = poly.getAttribute("points")
        if (!p) {
            p = ""
        }
        var c = p.split(' ')
        poly.setAttribute("points", p + parseInt(pt.x) + "," + parseInt(pt.y) + " ")

        if (c.length == 4) {
            $('#myModalSave').modal('show')
            
        }
        
    }
}
function closePoly(){
    var zonNum=document.getElementById("zonNum")
    var zonType=document.getElementById("zonType")
    zonNum.value=""
    zonType.value=""
    $('#myModalSave').modal('toggle')
    poly.remove()
    poly=null
}
function savePoly(){
    var zonNum=document.getElementById("zonNum")
    var zonType=document.getElementById("zonType")

    //TODO SEND REQEST 
    poly.getAttribute("points")
    zonNum.value
    zonType.value

    //END TODO

    zonNum.value=""
    zonType.value=""
    $('#myModalSave').modal('toggle')
    poly = null
}

window.onload = () => {
    var scrollView = document.getElementById("scrollView")
    scrollView.addEventListener("dblclick", (event) => {ckSvg(event)});    
}



function MouseDownHandler(e, obj) {
    e = e || window.event; //window.event for IE
    if (e.button == 0) {
        oldPos.x = e.clientX;
        oldPos.y = e.clientY;
        scrollingTheView = true;
        return false;
    }
    return true;
}

function MouseUpHandler(e, obj) {
    e = e || window.event; //window.event for IE
    if (e.button == 0) {
        scrollingTheView = false;
        return false;
    }
    return true;
}

function MouseMoveHandler(e, obj) {
    e = e || window.event; //window.event for IE
    if (scrollingTheView) {
        var dx = e.clientX - oldPos.x;
        var dy = e.clientY - oldPos.y;
        oldPos.x = e.clientX;
        oldPos.y = e.clientY;


        //svgElementId.style.left = boardOffset.x.toString() + "px";
        //svgElementId.style.top = boardOffset.y.toString() + "px";
        const svg = document.querySelector('svg');
        var t = svg.getAttribute('viewBox').split(' ')

        var x = parseFloat(t[0])
        var y = parseFloat(t[1])
        var w = parseFloat(t[2])
        var h = parseFloat(t[3])

        var k = w / 1000

        x -= dx * k;
        y -= dy * k;

        svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);

        return false;
    }
    return true;
}

window.addEventListener("DOMContentLoaded", (event) => {
    const svg = document.querySelector('svg');

    // zooming
    svg.onwheel = function (event) {
        event.preventDefault();

        // set the scaling factor (and make sure it's at least 10%)
        let scale = event.deltaY / 1000;
        scale = Math.abs(scale) < .1 ? .1 * event.deltaY / Math.abs(event.deltaY) : scale;

        // get point in SVG space
        let pt = new DOMPoint(event.clientX, event.clientY);
        pt = pt.matrixTransform(svg.getScreenCTM().inverse());

        // get viewbox transform
        let [x, y, width, height] = svg.getAttribute('viewBox').split(' ').map(Number);

        // get pt.x as a proportion of width and pt.y as proportion of height
        let [xPropW, yPropH] = [(pt.x - x) / width, (pt.y - y) / height];

        // calc new width and height, new x2, y2 (using proportions and new width and height)
        let [width2, height2] = [width + width * scale, height + height * scale];
        let x2 = pt.x - xPropW * width2;
        let y2 = pt.y - yPropH * height2;

        svg.setAttribute('viewBox', `${x2} ${y2} ${width2} ${height2}`);
    }
})

function findRelativePosition(obj) {
    var curleft = 0.0;
    var curtop = 0.0;
    do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return { 'x': curleft, 'y': curtop };
}



function clproc(el) {
    if (el.hidden)
        return
    var newPastHelper = document.getElementById("newPastHelper")
    newPastHelper.innerText = "";
    var workImg = document.getElementById('workImg')
    var zoneNum = document.getElementById('zoneNum')
    var placeNum = document.getElementById('placeNum')
    if (workImg) {
        workImg.remove();
    }
    if (zoneNum) {
        zoneNum.remove();
    }

    if (placeNum) {
        placeNum.remove();
    }


    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('myModal'))

    var title = document.getElementById('exampleModalLabel')
    var img = document.getElementById('zineimg')

    var zonen = el.id.split('-')[1]
    var area = document.getElementsByTagName('area')

    for (var ell of area) {
        ell.hidden = false
        ell.title = "Место " + ell.dataset.num + " Свободно"
    }

    httpGetAsync('/getWorkinZone?zoneid=' + zonen, (text) => {
        var d = JSON.parse(text);
        if (d.length == 3) {
            newPastHelper.innerText = "В этой зоне все места заняты"
            return
        }
        for (var elу of d) {
            for (var ell of area) {
                if (ell.dataset.num == elу.place) {
                    ell.hidden = true
                    ell.title = "Занято"
                }
            }
        }
    })

    title.innerHTML = `Зона: ${zonen}`
    if (el.dataset.type == "1") {
        img.setAttribute('src', `img/22.jpg`)
        img.setAttribute('usemap', `#Map2`)
    }
    if (el.dataset.type == "2") {
        img.setAttribute('src', `img/11.jpg`)
        img.setAttribute('usemap', `#Map1`)
    }
    modal.show();
    a = document.getElementById('zoneId')
    b = document.getElementById('inputValue')
    a.innerHTML = ``
    b.innerHTML = ``
    // alert(el.id)
    var tt = el.dataset.type
    if (tt == 1) {
        tt = 2
    } else if (tt == 2) {
        tt = 1
    }
    var map = document.getElementById('Map' + tt);
    map.addEventListener('click', eXFunction, false);
}




function eXFunction(e) {
    if (e.target !== e.currentTarget) {
        if (e.target.hidden)
            return
        var title = document.getElementById('exampleModalLabel')
        var clickedBtn = e.target.dataset.num;
        var zoneId = document.getElementById('zoneId')
        zoneId.innerHTML = `<i id="zoneNum">${title.innerText}</i>, <i id="placeNum">Место ${clickedBtn}</i>`
    }
    e.stopPropagation();
}

function sendWork() {
    var name = document.getElementById('inputValue')
    var zoneNum = document.getElementById('zoneNum')
    var placeNum = document.getElementById('placeNum')
    var newPastHelper = document.getElementById("newPastHelper")

    var workImg = document.getElementById('workImg')

    if (!zoneNum || !placeNum || name.value == "" || !workImg) {
        newPastHelper.innerText = "Выберите место размещения и введите имя, и выбирите работу"
        return
    }


    var file = workImg.src.split('/').pop()
    //uid,files,name,zone,place

    httpGetAsync("/addWorkToShow?file=" + file + "&name=" + name.value + "&zone=" + zoneNum.innerText.split(' ').pop() + "&place=" + placeNum.innerText.split(' ').pop(), (text) => {
        if (text == 'OK') {
            createPost(`Моя новая работа будет на выставке! ${name.innerText} Увидить в живую можно в локации ${zoneNum.innerText}`, file)
        }
    })
}


function createPost(postText, file) {
    var res = []
    res.push(file)
    // res.push(el.src.split('/').pop())
    httpGetAsync("/addPost?text=" + postText +
        "&files=" + JSON.stringify(res), (text) => {
            if (text == "OK") {
                window.location.replace("/profile.html")
            }
            console.log(text)
        })
}

function addMedia() {
    var mediaRoot = document.getElementById("mediaRoot")
    var input = document.createElement('input')
    input.setAttribute("type", 'file')
    input.onchange = () => {
        uploadFile(input.files[0], (text) => {
            var img = document.createElement('img')
            img.setAttribute('src', 'uploads/' + text)
            img.setAttribute('class', "mediaImgStyle")
            img.setAttribute('height', '100')
            img.setAttribute('id', 'workImg')
            mediaRoot.appendChild(img)
        })
    }
    input.click()
}