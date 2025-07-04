async function getValues() {
    try {
        const response = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,GBP-BRL,EUR-BRL,ARS-BRL,CLP-BRL,JPY-BRL");
        const data = await response.json();
        console.log(data);

        const moedas = [
            { code: "USD", nome: "Dólar" },
            { code: "GBP", nome: "Libra" },
            { code: "EUR", nome: "Euro" },
            { code: "ARS", nome: "Peso Argentino" },
            { code: "CLP", nome: "Peso Chileno" },
            { code: "JPY", nome: "Iene Japonês" }
        ];

        moedas.forEach(({ code }) => {
            const info = data[`${code}BRL`];
            if (!info) return;

            const priceElement = document.getElementById(`${code.toLowerCase()}-price`);
            const changeElement = document.getElementById(`${code.toLowerCase()}-change`);

            if (priceElement) priceElement.textContent = parseFloat(info.bid).toFixed(2);
            if (changeElement) {
                const change = parseFloat(info.pctChange).toFixed(2);
                const isPositive = info.pctChange > 0;
                changeElement.textContent = `${change}% ${isPositive ? "▲" : "▼"}`;
                changeElement.style.color = isPositive ? "green" : "red";
            }
        });
    } catch (error) {
        console.error("Erro ao buscar os dados:", error);
    }
}

let form = document.getElementById("converterForm");

const amount = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertedAmount = document.getElementById("convertedamount");
const loading = document.querySelector(".loading");
const error = document.querySelector(".error");

async function convertMoney() {
    loading.style.display = "block";
    error.style.display = "none";

    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amountValue = parseFloat(amount.value);

     if (isNaN(amountValue) || amountValue <= 0) {
        error.style.display = "block";
        error.innerHTML = "Por favor, insira um valor válido maior que zero.";
        loading.style.display = "none";
        return;
    }


    if (from === to) {
        convertedAmount.value = parseFloat(amount.value).toFixed(2);
        loading.style.display = "none";
        return;
    }

    try {
         if (from === "BRL") {
            const url = `https://economia.awesomeapi.com.br/json/last/${to}-BRL`;
            const response = await fetch(url);
            const data = await response.json();
            const key = `${to}BRL`;
            const rate = parseFloat(data[key].bid);

            const result = (amountValue / rate).toFixed(2);
            convertedAmount.value = result;

        } else if (to === "BRL") {
            const url = `https://economia.awesomeapi.com.br/json/last/${from}-BRL`;
            const response = await fetch(url);
            const data = await response.json();
            const key = `${from}BRL`;
            const rate = parseFloat(data[key].bid);

            const result = (amountValue * rate).toFixed(2);
            convertedAmount.value = result;

        } else{


            
        const url = `https://economia.awesomeapi.com.br/json/last/${from}-${to}`;
        const response = await fetch(url);
        const data = await response.json();

        const key = `${from}${to}`;
        const rate = parseFloat(data[key].bid);

        const result = (parseFloat(amount.value) * rate).toFixed(2);
        convertedAmount.value = result;
            
        }
    } catch (err) {
        error.style.display = "block";
        error.innerHTML = "Falha ao converter o valor da moeda, tente novamente!";
        console.error(err);
    }

    loading.style.display = "none";
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    convertMoney();
});

getValues();

let chartInstance = null;

async function carregarGrafico(moeda = "USD-BRL") {
    try {
        const res = await fetch(`https://economia.awesomeapi.com.br/json/daily/${moeda}/7`);
        const data = await res.json();

        const labels = data.map(entry => {
            const date = new Date(entry.timestamp * 1000);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }).reverse();

        const valores = data.map(entry => parseFloat(entry.bid)).reverse();

        const ctx = document.getElementById("moedaChart").getContext("2d");

        if(chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: moeda.replace("-BRL", "") + "/BRL",
                    data: valores,
                    fill: true,
                    borderColor: "#fbc02d",
                    backgroundColor: "rgba(255, 235, 59, 0.2)",
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: "index", intersect: false }
                },
                interaction: {
                    mode: "nearest",
                    axis: "x",
                    intersect: false
                },
                scales: {
                    y: {
                        title: { display: true, text: "Valor em R$" }
                    },
                    x: {
                        title: { display: true, text: "Data" }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao carregar o gráfico:", error);
    }
}

document.getElementById("moedaSelect").addEventListener("change", (e) => {
    carregarGrafico(e.target.value);
});

carregarGrafico();

setInterval(getValues, 60000);