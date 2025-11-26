document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const resultDiv = document.getElementById("form-result");
  if (!form) return;

  const fields = {
    vardas: form.vardas,
    pavarde: form.pavarde,
    email: form.email,
    telefonas: form.telefonas,
    adresas: form.adresas,
    dizainas: form.dizainas,
    turinys: form.turinis || form.turinys,
    patogumas: form.patogumas
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  function setError(input, message) {
    input.classList.add("input-error");

    let error = input.nextElementSibling;
    if (!error || !error.classList.contains("error-text")) {
      error = document.createElement("div");
      error.className = "error-text";
      input.parentNode.insertBefore(error, input.nextSibling);
    }
    error.textContent = message;
  }

  function clearError(input) {
    input.classList.remove("input-error");
    let error = input.nextElementSibling;
    if (error && error.classList.contains("error-text")) {
      error.textContent = "";
    }
  }

  // showErrors = true – rodo klaidas, false – tikrina tyliai (mygtukui)
  function validateField(name, showErrors = true) {
    const input = fields[name];
    if (!input) return true;
    const value = input.value.trim();
    let errorMessage = "";

    // Privaloma
    if (!value) {
      errorMessage = "Šis laukas privalomas.";
    } else {
      if (name === "vardas" || name === "pavarde") {
        const nameRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s'-]+$/;
        if (!nameRegex.test(value)) {
          errorMessage = "Naudokite tik raides.";
        }
      }

      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = "Neteisingas el. pašto formatas.";
        }
      }

      if (name === "adresas") {
        if (value.length < 4) {
          errorMessage = "Adresas per trumpas.";
        }
      }

      if (name === "dizainas" || name === "turinys" || name === "patogumas") {
        const num = Number(value);
        if (Number.isNaN(num) || num < 1 || num > 10) {
          errorMessage = "Įveskite skaičių nuo 1 iki 10.";
        }
      }

      if (name === "telefonas") {
        // Švelnesnė validacija – leidžia 86..., 6..., +3706...
        const digits = value.replace(/\D/g, "");
        if (
          !(
            /^3706\d{7}$/.test(digits) || // +3706xxxxxxx
            /^86\d{7}$/.test(digits) ||   // 86xxxxxxx
            /^6\d{7}$/.test(digits)       // 6xxxxxxx
          )
        ) {
          errorMessage = "Įveskite teisingą tel. numerį (pvz. 86xxxxxxx).";
        }
      }
    }

    if (showErrors) {
      if (errorMessage) {
        setError(input, errorMessage);
      } else {
        clearError(input);
      }
    }

    return !errorMessage;
  }

  function updateSubmitState() {
    let allValid = true;
    for (const name in fields) {
      // Tikrinam tyliai – be klaidų rodymo
      if (!validateField(name, false)) {
        allValid = false;
      }
    }
    if (submitBtn) {
      submitBtn.disabled = !allValid;
    }
  }

  // Švelnesnis telefono apdorojimas: išvalo simbolius, padeda +370 tik jei aišku
  function handlePhoneInput(e) {
    let digits = e.target.value.replace(/\D/g, "");

    // Konvertuojam dažniausius variantus
    if (digits.startsWith("86")) {
      // 86xxxxxxx -> 3706xxxxxxx
      digits = "3706" + digits.slice(2);
    } else if (digits.startsWith("6")) {
      // 6xxxxxxx -> 3706xxxxxxx
      digits = "370" + digits;
    }

    if (digits.startsWith("370")) {
      e.target.value = "+" + digits; // +3706xxxxxxx
    } else {
      e.target.value = digits; // paliekam tik skaičius, jei kas kita
    }
  }

  Object.keys(fields).forEach((name) => {
    const input = fields[name];
    if (!input) return;

    if (name === "telefonas") {
      input.addEventListener("input", (e) => {
        handlePhoneInput(e);
        validateField("telefonas", true);
        updateSubmitState();
      });
    } else {
      input.addEventListener("input", () => {
        // Validuojam tik tą lauką, kurį dabar pildo
        validateField(name, true);
        updateSubmitState();
      });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Paskutinė patikra
    updateSubmitState();
    if (submitBtn && submitBtn.disabled) return;

    const formData = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      email: fields.email.value.trim(),
      telefonas: fields.telefonas.value.trim(),
      adresas: fields.adresas.value.trim(),
      dizainas: fields.dizainas.value.trim(),
      turinys: fields.turinys.value.trim(),
      patogumas: fields.patogumas.value.trim()
    };

    console.log(formData);

    const diz = Number(formData.dizainas);
    const tur = Number(formData.turinys);
    const pat = Number(formData.patogumas);
    const avg = ((diz + tur + pat) / 3).toFixed(1);

    if (resultDiv) {
      resultDiv.innerHTML = `
        <h5>Įvesti duomenys:</h5>
        <p>
          Vardas: <strong>${formData.vardas}</strong><br>
          Pavardė: <strong>${formData.pavarde}</strong><br>
          El. paštas: <strong>${formData.email}</strong><br>
          Tel. numeris: <strong>${formData.telefonas}</strong><br>
          Adresas: <strong>${formData.adresas}</strong><br>
          Dizaino vertinimas: <strong>${formData.dizainas}/10</strong><br>
          Turinio vertinimas: <strong>${formData.turinys}/10</strong><br>
          Patogumo vertinimas: <strong>${formData.patogumas}/10</strong>
        </p>
        <p style="font-size: 1.2rem; color: #ff6600;">
          <strong>${formData.vardas} ${formData.pavarde} vidurkis:</strong> ${avg}
        </p>
      `;
    }

    showSuccessPopup();
  });
});

function showSuccessPopup() {
  const popup = document.getElementById("success-popup");
  if (!popup) return;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}
