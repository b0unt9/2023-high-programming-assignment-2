const xmlToJson = (xml) => {
    let obj = {};

    if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) obj = xml.nodeValue;

    let textNodes = [].slice.call(xml.childNodes).filter(node => node.nodeType === 3);
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce((text, node) => text + node.nodeValue, "");
    } else if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; ++i) {
            let item = xml.childNodes.item(i);
            let nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push == "undefined") {
                    let old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

fetch('https://apis.data.go.kr/1741000/RegistrationPopulationByRegion/getRegistrationPopulationByRegion?serviceKey=%2FmzPHb2utqxS9KVvHBkQzrzTq3SDWoMlKroYp7P4QgRpfd8RySzF3x4Et%2FnUIMe2jhT1i1Fr3anjWwD2wRLcMQ%3D%3D&pageNo=1&numOfRows=17')
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, 'application/xml'))
    .then((xml) => {
        return xmlToJson(xml);
    }).then((json) => {
    const data = json['RegistrationPopulationByRegion']['row'];
    const total = data['0'].population_tot;
    const chart = document.getElementById('chartBody');
    data.shift()
    Array.from(data).forEach((e, i) => {
        let tr = document.createElement('tr');
        let th = document.createElement('th')
        th.innerText = data[i]['regi'];

        let td = document.createElement('td');
        td.style.cssText = `--size: calc( ${(data[i].population_tot / total * 100).toFixed(5)}%);`;

        let span = document.createElement('span');
        span.innerText = `${(data[i].population_tot / total * 100).toFixed(5)}%`

        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        chart.appendChild(tr);
    })
})

const now = new Date();
const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
const nowDate = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
const today = now.getFullYear() + "" + month + "" + nowDate;
const hour = now.getMinutes() > 40 ? now.getHours() : now.getHours() - 1;
const time = hour < 10 ? '0' + hour + '00' : hour + '00';

fetch(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=%2FmzPHb2utqxS9KVvHBkQzrzTq3SDWoMlKroYp7P4QgRpfd8RySzF3x4Et%2FnUIMe2jhT1i1Fr3anjWwD2wRLcMQ%3D%3D&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=${time}&nx=98&ny=76`)
    .then(res => res.json())
    .then(data => data.response.body.items.item)
    .then(data => Array.from(data).filter(v => v.category === 'T1H'))
    .then(data => data[0].obsrValue)
    .then(t => {
        const temperature = document.getElementById('temperature');
        temperature.innerText = `부산 현재 기온: ${t} °C`
    })

