//
function Validator(options) {
  const selectorRules = {};
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }

      element = element.parentElement;
    }
  }

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    const errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    let errorMessage;

    // Lấy ra các rules của selector
    const rules = selectorRules[rule.selector];

    // Lặp qua từng rule và kiểm tra
    // Nếu có lỗi, dừng việc kiểm tra
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":

        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;

        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessage;
  }

  // Lấy element của form cần validate
  const formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      // Thực hiện lặp qua từng rule và validate
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);

        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          const enableInputs = formElement.querySelectorAll("[name]");

          const formValues = Array.from(enableInputs).reduce(
            (values, input) => {
              values[input.name] = input.value;
              return values;
            },
            {}
          );
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }

      // Trường hợp submit với hành vi mặc định
    };
    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện: blur, input, focus,..)
    options.rules.forEach((rule) => {
      //Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
      }

      // Xử lý mỗi khi người dùng nhập vào input
      inputElement.oninput = function () {
        const errorElement = getParent(
          inputElement,
          options.formGroupSelector
        ).querySelector(".form-message");
        errorElement.innerText = "";
        getParent(inputElement, options.formGroupSelector).classList.remove(
          "invalid"
        );
      };
    });
  }
}

// Định nghĩa Rules
// Nguyên tắc các rules:
// 1. Khi lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Ko trả ra gì cả (undefined)

Validator.isRequired = (selector) => {
  return {
    selector,
    test: function (value, message) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = (selector, message) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return {
    selector,
    test: function (value) {
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = (selector, min, message) => {
  return {
    selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector,
    test: function (value) {
      return value === getConfirmedValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
