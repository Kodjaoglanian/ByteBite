document.getElementById('calculator-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const gender = document.getElementById('gender').value;
    const age = parseFloat(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = document.getElementById('activity').value;
    const objective = document.getElementById('objective').value;
    const ageGroup = document.getElementById('age_group').value;

    let bmr;

    if (gender === 'masculino') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    let activityFactor;

    switch(activity) {
        case 'sedentario':
            activityFactor = 1.2;
            break;
        case 'leve':
            activityFactor = 1.375;
            break;
        case 'moderado':
            activityFactor = 1.55;
            break;
        case 'intenso':
            activityFactor = 1.725;
            break;
        default:
            activityFactor = 1.2;
    }

    const tdee = bmr * activityFactor;

    // Cálculo de Proteína
    let protein;
    if (ageGroup === 'crianca') {
        protein = 1.1 * weight; // 1 a 1.2 g/kg, usamos 1.1 como média
    } else {
        switch(objective) {
            case 'manter':
                protein = gender === 'masculino' ? 56 : 46;
                break;
            case 'ganhar':
                protein = weight * 1.7; // média entre 1.4 e 2
                break;
            case 'atividade_intensa':
                protein = weight * 1.6; // média entre 1.2 e 2
                break;
            default:
                protein = gender === 'masculino' ? 56 : 46;
        }
    }

    // Cálculo de Macronutrientes
    const carbs = (tdee * 0.55) / 4; // 55% das calorias diárias em carboidratos (1g = 4 calorias)
    const fats = (tdee * 0.25) / 9; // 25% das calorias diárias em gorduras (1g = 9 calorias)

    const calorieGoal = parseFloat(document.getElementById('calorie_goal').value);
    const calorieBalance = calorieGoal - tdee;

    document.getElementById('results').innerHTML = `
        <p>Seu BMR é: ${bmr.toFixed(2)} calorias/dia.</p>
        <p>Suas necessidades calóricas diárias (TDEE) são: ${tdee.toFixed(2)} calorias/dia.</p>
        <p>Quantidade recomendada de proteína: ${protein.toFixed(2)} gramas por dia.</p>
        <p>Quantidade recomendada de carboidratos: ${carbs.toFixed(2)} gramas por dia.</p>
        <p>Quantidade recomendada de gorduras: ${fats.toFixed(2)} gramas por dia.</p>
        <p>Objetivo Diário: ${calorieGoal} calorias.</p>
        <p>Saldo de Calorias: ${calorieBalance.toFixed(2)} calorias.</p>
    `;

    // Salvar dados localmente
    localStorage.setItem('calculatorResults', JSON.stringify({
        bmr: bmr.toFixed(2),
        tdee: tdee.toFixed(2),
        protein: protein.toFixed(2),
        carbs: carbs.toFixed(2),
        fats: fats.toFixed(2),
        calorieGoal: calorieGoal.toFixed(2),
        calorieBalance: calorieBalance.toFixed(2)
    }));

    // Gerar gráfico
    generateChart(bmr, tdee, protein, carbs, fats, calorieGoal);
});

// Função para Gerar Gráfico
function generateChart(bmr, tdee, protein, carbs, fats, calorieGoal) {
    const ctx = document.getElementById('results-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['BMR', 'TDEE', 'Proteína', 'Carboidratos', 'Gorduras', 'Objetivo'],
            datasets: [{
                label: 'Valores',
                data: [bmr, tdee, protein, carbs, fats, calorieGoal],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para Enviar Resultados por Email
document.getElementById('send-results-email').addEventListener('click', function() {
    const results = JSON.parse(localStorage.getItem('calculatorResults'));
    const emailBody = `
        Resultados da Calculadora de Dieta e Calorias:
        BMR: ${results.bmr} calorias/dia
        TDEE: ${results.tdee} calorias/dia
        Proteína: ${results.protein} gramas por dia
        Carboidratos: ${results.carbs} gramas por dia
        Gorduras: ${results.fats} gramas por dia
        Objetivo Diário: ${results.calorieGoal} calorias
        Saldo de Calorias: ${results.calorieBalance} calorias
    `;
    window.location.href = `mailto:?subject=Resultados da Calculadora de Dieta e Calorias&body=${encodeURIComponent(emailBody)}`;
});

// Função para Gerar PDF dos Resultados da Calculadora
document.getElementById('generate-results-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adicionar cabeçalho
    doc.setFontSize(18);
    doc.text('Resultados da Calculadora de Dieta e Calorias', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('ByteBite', 105, 30, null, null, 'center');
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    let yOffset = 45; // Y offset inicial

    const results = document.getElementById('results').innerText.split('\n');
    results.forEach(function(result) {
        doc.setFontSize(12);
        doc.text(result, 10, yOffset);
        yOffset += 10;
    });

    // Adicionar rodapé
    doc.setLineWidth(0.5);
    doc.line(10, 280, 200, 280);
    doc.setFontSize(10);
    doc.text('Gerado por ByteBite', 105, 290, null, null, 'center');

    doc.save('resultados_calculadora.pdf');
});

// Nova funcionalidade para Planejador de Refeições
const modal = document.getElementById('meal-modal');
const closeModal = document.querySelector('.close');
const saveMealBtn = document.getElementById('save-meal');
let currentMealSection;

document.querySelectorAll('.add-meal').forEach(function(button) {
    button.addEventListener('click', function() {
        currentMealSection = this.parentElement;
        modal.style.display = 'block';
    });
});

closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

saveMealBtn.addEventListener('click', function() {
    const mealInput = document.getElementById('meal-input').value || 'Refeição';
    const mealQuantity = document.getElementById('meal-quantity').value || '1';
    const mealWeight = document.getElementById('meal-weight').value || '0';
    const mealCalories = document.getElementById('meal-calories').value || '0';

    const mealList = currentMealSection.querySelector('.meal-list');
    const li = document.createElement('li');
    li.innerHTML = `
        ${mealInput} - Quantidade: ${mealQuantity}, Peso: ${mealWeight}g, Calorias: ${mealCalories} kcal
        <button class="remove-meal">&times;</button>
    `;

    const removeBtn = li.querySelector('.remove-meal');
    removeBtn.addEventListener('click', function() {
        this.parentElement.remove();
    });

    mealList.appendChild(li);

    document.getElementById('meal-input').value = '';
    document.getElementById('meal-quantity').value = '';
    document.getElementById('meal-weight').value = '';
    document.getElementById('meal-calories').value = '';
    modal.style.display = 'none';
});

// Função para Gerar PDF
document.getElementById('generate-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adicionar cabeçalho
    doc.setFontSize(18);
    doc.text('Planejador de Refeições ByteBite', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('ByteBite', 105, 30, null, null, 'center');
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    let yOffset = 45; // Y offset inicial

    document.querySelectorAll('.meal').forEach(function(mealSection) {
        const mealName = mealSection.querySelector('h3').innerText;
        doc.setFontSize(14);
        doc.text(mealName, 10, yOffset);
        yOffset += 10;

        const mealItems = mealSection.querySelectorAll('.meal-list li');
        mealItems.forEach(function(item, index) {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${item.textContent.replace('×', '').trim()}`, 15, yOffset);
            yOffset += 10;
        });

        yOffset += 10; // Espaço entre seções
    });

    // Adicionar rodapé
    doc.setLineWidth(0.5);
    doc.line(10, 280, 200, 280);
    doc.setFontSize(10);
    doc.text('Gerado por ByteBite', 105, 290, null, null, 'center');

    doc.save('planejador_de_refeicoes.pdf');
});

// Função para Exportar Dados em CSV
document.getElementById('generate-csv').addEventListener('click', function() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Refeição,Item\n";

    document.querySelectorAll('.meal').forEach(function(mealSection) {
        const mealName = mealSection.querySelector('h3').innerText;
        const mealItems = mealSection.querySelectorAll('.meal-list li');
        mealItems.forEach(function(item) {
            csvContent += `${mealName},${item.textContent.replace('×', '').trim()}\n`;
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "planejador_de_refeicoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Função para Limpar Refeições
document.getElementById('clear-meals').addEventListener('click', function() {
    document.querySelectorAll('.meal-list').forEach(function(mealList) {
        mealList.innerHTML = '';
    });
});

// Navegação Suave

document.querySelectorAll('nav ul li a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        window.scrollTo({
            top: targetSection.offsetTop - 70, // Ajuste para a altura da navbar
            behavior: 'smooth'
        });
    });
});
// Função para Atualizar o Consumo de Água
function updateWaterCount() {
    let waterCount = localStorage.getItem('waterCount') ? parseInt(localStorage.getItem('waterCount')) : 0;
    document.getElementById('water-count').innerText = waterCount;
}

// Evento para Adicionar Copo de Água
document.getElementById('add-water').addEventListener('click', function() {
    let waterCount = localStorage.getItem('waterCount') ? parseInt(localStorage.getItem('waterCount')) : 0;
    waterCount += 1;
    localStorage.setItem('waterCount', waterCount);
    updateWaterCount();
});

// Inicializar o Rastreador de Água ao Carregar a Página
window.addEventListener('load', function() {
    updateWaterCount();
});