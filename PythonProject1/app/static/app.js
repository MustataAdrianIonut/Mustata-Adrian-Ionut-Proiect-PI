
function $(id) { return document.getElementById(id); }

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setHTML(targetId, html) {
  const el = $(targetId);
  if (!el) return;
  el.innerHTML = html ?? "";
}

function setText(targetId, text) {
  const el = $(targetId);
  if (!el) return;
  el.textContent = text || "";
}

function renderKV(obj, order, labels) {
  if (!obj) return `<div class="small">No data.</div>`;
  const keys = order || Object.keys(obj);

  let html = `<div class="kv">`;
  for (const k of keys) {
    if (!(k in obj)) continue;
    const label = (labels && labels[k]) ? labels[k] : k;
    const val = obj[k];
    html += `
      <div class="k">${escapeHtml(label)}</div>
      <div class="v">${escapeHtml(val)}</div>
    `;
  }
  html += `</div>`;
  return html;
}

function renderFoodsTable(foods) {
  if (!foods || foods.length === 0) return `<div class="small">No foods.</div>`;
  let html = `<table class="table">
    <thead>
      <tr>
        <th>ID</th><th>Name</th><th>Meal type</th><th>kcal/100g</th><th>P</th><th>F</th><th>C</th>
      </tr>
    </thead><tbody>`;
  for (const f of foods) {
    html += `<tr>
      <td>${escapeHtml(f.id)}</td>
      <td>${escapeHtml(f.name)}</td>
      <td>${escapeHtml(f.meal_type ?? "-")}</td>
      <td>${escapeHtml(f.kcal_100g)}</td>
      <td>${escapeHtml(f.protein_100g)}</td>
      <td>${escapeHtml(f.fat_100g)}</td>
      <td>${escapeHtml(f.carb_100g)}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderMealsTable(meals) {
  if (!meals || meals.length === 0) return `<div class="small">No meals.</div>`;
  let html = `<table class="table">
    <thead>
      <tr>
        <th>ID</th><th>Food ID</th><th>Grams</th>
      </tr>
    </thead><tbody>`;
  for (const m of meals) {
    html += `<tr>
      <td>${escapeHtml(m.id)}</td>
      <td>${escapeHtml(m.food_id)}</td>
      <td>${escapeHtml(m.grams)}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderDailySummary(summary) {
  const header = renderKV(
    {
      user_id: summary.user_id,
      recommended_calories: summary.recommended_calories,
      total_meal_calories: summary.total_meal_calories
    },
    ["user_id", "recommended_calories", "total_meal_calories"],
    { user_id:"User ID", recommended_calories:"Recommended (kcal)", total_meal_calories:"Consumed (kcal)" }
  );

  let table = `<div class="small" style="margin-top:10px; margin-bottom:6px;">Meals</div>`;
  table += `<table class="table">
    <thead><tr>
      <th>ID</th><th>Food</th><th>Grams</th><th>Kcal</th><th>P</th><th>F</th><th>C</th>
    </tr></thead><tbody>`;

  for (const m of (summary.meals || [])) {
    table += `<tr>
      <td>${escapeHtml(m.meal_id)}</td>
      <td>${escapeHtml(m.food_name)}</td>
      <td>${escapeHtml(m.grams)}</td>
      <td>${escapeHtml(m.kcal)}</td>
      <td>${escapeHtml(m.protein_g)}</td>
      <td>${escapeHtml(m.fat_g)}</td>
      <td>${escapeHtml(m.carb_g)}</td>
    </tr>`;
  }
  table += `</tbody></table>`;

  return header + table;
}

function renderPlan(plan) {
  const header = renderKV(
    { recommended_calories: plan.recommended_calories },
    ["recommended_calories"],
    { recommended_calories:"Recommended calories (kcal)" }
  );

  let table = `<div class="small" style="margin-top:10px; margin-bottom:6px;">Plan</div>`;
  table += `<table class="table">
    <thead><tr>
      <th>Meal</th><th>Food</th><th>Food ID</th><th>Grams</th><th>Kcal</th><th>P</th><th>F</th><th>C</th>
    </tr></thead><tbody>`;

  for (const it of (plan.meals || [])) {
    table += `<tr>
      <td>${escapeHtml(it.meal_name)}</td>
      <td>${escapeHtml(it.food_name)}</td>
      <td>${escapeHtml(it.food_id)}</td>
      <td>${escapeHtml(it.grams)}</td>
      <td>${escapeHtml(it.kcal)}</td>
      <td>${escapeHtml(it.protein_g)}</td>
      <td>${escapeHtml(it.fat_g)}</td>
      <td>${escapeHtml(it.carb_g)}</td>
    </tr>`;
  }
  table += `</tbody></table>`;

  return header + table;
}


function formatApiError(data, statusCode) {
  let msg = (data && data.detail !== undefined) ? data.detail : data;


  if (Array.isArray(msg)) {
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  }


  if (typeof msg === "object" && msg !== null) {
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  }

  if (!msg) msg = `HTTP ${statusCode}`;
  return String(msg);
}


async function api(path, options = {}) {

  const mergedHeaders = {
    ...(options.headers || {}),
  };

  if (!("Content-Type" in mergedHeaders)) {
    mergedHeaders["Content-Type"] = "application/json";
  }


  const finalOptions = { ...options, headers: mergedHeaders };
  if (finalOptions.body && typeof finalOptions.body === "object" && !(finalOptions.body instanceof FormData)) {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  const res = await fetch(path, finalOptions);

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = formatApiError(data, res.status);
    throw new Error(msg);
  }

  return data;
}



//mod:"user"|"admin"
function setMode(mode) { localStorage.setItem("mode", mode); }
function getMode() { return localStorage.getItem("mode") || "none"; }

function setAdminPassword(pw) { localStorage.setItem("admin_password", pw); }
function getAdminPassword() { return localStorage.getItem("admin_password") || ""; }
function clearAdmin() { localStorage.removeItem("admin_password"); }

function setUser(user) { localStorage.setItem("current_user", JSON.stringify(user)); }
function getUser() {
  const v = localStorage.getItem("current_user");
  return v ? JSON.parse(v) : null;
}
function clearUser() { localStorage.removeItem("current_user"); }

function logoutAll() {
  setMode("none");
  clearUser();
  clearAdmin();
}

async function apiAdmin(path, options = {}) {
  const pw = getAdminPassword();
  return api(path, {
    ...options,
    headers: { ...(options.headers || {}), "X-Admin-Password": pw }
  });
}

//Tab
function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (btn) btn.classList.add("active");

  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  const panel = document.getElementById(`tab-${tabName}`);
  if (panel) panel.classList.add("active");
}

function applyModeUI() {
  const mode = getMode();

  const btnLogin   = $("tabBtnLogin");
  const btnProfile = $("tabBtnProfile");
  const btnFoods   = $("tabBtnFoods");
  const btnMeals   = $("tabBtnMeals");
  const btnPlan    = $("tabBtnPlan");
  const btnAdmin   = $("tabBtnAdmin");
  const btnLogout  = $("tabBtnLogout");

  const hide = (el) => { if (el) el.style.display = "none"; };
  const show = (el) => { if (el) el.style.display = "inline-block"; };

  if (mode === "none") {
    show(btnLogin);
    hide(btnProfile); hide(btnFoods); hide(btnMeals); hide(btnPlan);
    hide(btnAdmin);
    hide(btnLogout);
    activateTab("login");
    return;
  }

  if (mode === "admin") {
    hide(btnLogin);
    hide(btnProfile); hide(btnFoods); hide(btnMeals); hide(btnPlan);
    show(btnAdmin);
    show(btnLogout);
    activateTab("admin");
    return;
  }

  if (mode === "user") {
    hide(btnLogin);
    show(btnProfile); show(btnFoods); show(btnMeals); show(btnPlan);
    hide(btnAdmin);
    show(btnLogout);
    activateTab("profile");
    return;
  }
}

function clearAllResults() {
  setHTML("meUserResult", "");
  setHTML("caloriesResult", "");
  setHTML("foodsList", "");
  setHTML("foodsResult", "");
  setHTML("mealsResult", "");
  setHTML("mealSummaryResult", "");
  setHTML("planResult", "");
  setHTML("adminUsersResult", "");
  setHTML("adminFoodResult", "");
  setHTML("adminFoodsResult", "");

  setText("loginResult", "");
  setText("usersResult", "");
  setText("adminResult", "");
}

function setupTabs() {
  document.querySelectorAll(".tab[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  const logoutBtn = $("tabBtnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutAll();
      clearAllResults();
      applyModeUI();
    });
  }
}


//Login / Signup

function setupLogin() {
  const btnHaveAccount = $("btnHaveAccount");
  const btnNoAccount   = $("btnNoAccount");
  const userLoginBox   = $("userLoginBox");
  const userSignupBox  = $("userSignupBox");

  if (btnHaveAccount) {
    btnHaveAccount.addEventListener("click", () => {
      if (userLoginBox) userLoginBox.style.display = "block";
      if (userSignupBox) userSignupBox.style.display = "none";
      setText("loginResult", "");
      setText("usersResult", "");
    });
  }

  if (btnNoAccount) {
    btnNoAccount.addEventListener("click", () => {
      if (userLoginBox) userLoginBox.style.display = "none";
      if (userSignupBox) userSignupBox.style.display = "block";
      setText("loginResult", "");
      setText("usersResult", "");
    });
  }

  const btnUserLogin = $("btnUserLogin");
  if (btnUserLogin) {
    btnUserLogin.addEventListener("click", async () => {
      try {
        const name = ($("login_name")?.value || "").trim();
        if (!name) {
          setText("loginResult", "Error: Introdu numele.");
          return;
        }

        const user = await api(`/auth/user?name=${encodeURIComponent(name)}`);
        setUser(user);

        clearAdmin();
        setMode("user");
        clearAllResults();
        applyModeUI();
      } catch (e) {
        setText("loginResult", "Error: " + e.message);
      }
    });
  }

  const btnCreateUser = $("btnCreateUser");
  if (btnCreateUser) {
    btnCreateUser.addEventListener("click", async () => {
      try {
        const payload = {
          name: ($("u_name")?.value || "").trim(),
          sex: $("u_sex")?.value || "m",
          age: Number($("u_age")?.value || 0),
          weight_kg: Number($("u_weight")?.value || 0),
          height_cm: Number($("u_height")?.value || 0),
          activity: $("u_activity")?.value || "moderat",
          goal: $("u_goal")?.value || "mentinere",
        };

        if (!payload.name) {
          setText("usersResult", "Error: Numele este obligatoriu.");
          return;
        }

        const user = await api("/users/", { method: "POST", body: payload }); // object -> auto JSON
        setUser(user);

        clearAdmin();
        setMode("user");
        clearAllResults();
        applyModeUI();
      } catch (e) {
        setText("usersResult", "Error: " + e.message);
      }
    });
  }

  const btnAdminLogin = $("btnAdminLogin");
  if (btnAdminLogin) {
    btnAdminLogin.addEventListener("click", async () => {
      try {
        const pw = $("admin_password")?.value || "";
        setAdminPassword(pw);

        // test password with admin endpoint
        await apiAdmin("/admin/users");

        clearUser();
        setMode("admin");
        clearAllResults();
        applyModeUI();
      } catch (e) {
        setText("adminResult", "Error: " + e.message);
      }
    });
  }
}


//user profil

function setupProfile() {
  const btnShowMe = $("btnShowMe");
  if (btnShowMe) {
    btnShowMe.addEventListener("click", () => {
      const u = getUser();
      if (!u) {
        setHTML("meUserResult", `<div class="small">Not logged in.</div>`);
        return;
      }
      setHTML(
        "meUserResult",
        renderKV(
          u,
          ["id","name","sex","age","weight_kg","height_cm","activity","goal"],
          {
            id:"ID", name:"Name", sex:"Sex", age:"Age",
            weight_kg:"Weight (kg)", height_cm:"Height (cm)",
            activity:"Activity", goal:"Goal"
          }
        )
      );
    });
  }

  const btnUserCalories = $("btnUserCalories");
  if (btnUserCalories) {
    btnUserCalories.addEventListener("click", async () => {
      try {
        const u = getUser();
        if (!u) {
          setHTML("caloriesResult", `<div class="small">Not logged in.</div>`);
          return;
        }
        const data = await api(`/users/${u.id}/calories`);
        setHTML(
          "caloriesResult",
          renderKV(
            data,
            ["bmr","tdee","recommended_calories"],
            { bmr:"BMR (kcal)", tdee:"TDEE (kcal)", recommended_calories:"Recommended (kcal)" }
          )
        );
      } catch (e) {
        setHTML("caloriesResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }

  const btnUserSummary = $("btnUserSummary");
  if (btnUserSummary) {
    btnUserSummary.addEventListener("click", async () => {
      try {
        const u = getUser();
        if (!u) {
          setHTML("caloriesResult", `<div class="small">Not logged in.</div>`);
          return;
        }
        const data = await api(`/users/${u.id}/summary`);
        setHTML("caloriesResult", renderDailySummary(data));
      } catch (e) {
        setHTML("caloriesResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }
}


//user foods
function setupFoods() {
  const btnLoadFoods = $("btnLoadFoods");
  if (!btnLoadFoods) return;

  btnLoadFoods.addEventListener("click", async () => {
    try {
      const foods = await api("/foods/");
      setHTML("foodsList", renderFoodsTable(foods));
      setHTML("foodsResult", `<span class="badge">Loaded ${foods.length} foods</span>`);
    } catch (e) {
      setHTML("foodsResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
    }
  });
}


//user meals
function setupMeals() {
  const btnAddMeal = $("btnAddMeal");
  if (btnAddMeal) {
    btnAddMeal.addEventListener("click", async () => {
      try {
        const u = getUser();
        if (!u) {
          setHTML("mealsResult", `<div class="small">Not logged in.</div>`);
          return;
        }

        const payload = {
          user_id: u.id,
          food_id: Number($("m_food_id")?.value || 0),
          grams: Number($("m_grams")?.value || 0),
        };

        if (!payload.food_id || !payload.grams) {
          setHTML("mealsResult", `<div class="small">Completează food_id și grams.</div>`);
          return;
        }

        const meal = await api("/meals/", { method: "POST", body: payload }); // object -> auto JSON

        setHTML(
          "mealsResult",
          renderKV(
            { id: meal.id, food_id: meal.food_id, grams: meal.grams },
            ["id","food_id","grams"],
            { id:"Meal ID", food_id:"Food ID", grams:"Grams" }
          )
        );
      } catch (e) {
        setHTML("mealsResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }

  const btnListMeals = $("btnListMeals");
  if (btnListMeals) {
    btnListMeals.addEventListener("click", async () => {
      try {
        const u = getUser();
        if (!u) {
          setHTML("mealsResult", `<div class="small">Not logged in.</div>`);
          return;
        }
        const meals = await api(`/meals/user/${u.id}`);
        setHTML("mealsResult", renderMealsTable(meals));
      } catch (e) {
        setHTML("mealsResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }

  const btnMealSummary = $("btnMealSummary");
  if (btnMealSummary) {
    btnMealSummary.addEventListener("click", async () => {
      try {
        const mealId = Number($("ms_meal_id")?.value || 0);
        if (!mealId) {
          setHTML("mealSummaryResult", `<div class="small">Introdu meal_id.</div>`);
          return;
        }
        const sum = await api(`/meals/${mealId}/summary`);
        setHTML(
          "mealSummaryResult",
          renderKV(
            sum,
            ["meal_id","food_id","grams","kcal","protein_g","fat_g","carb_g"],
            {
              meal_id:"Meal ID", food_id:"Food ID", grams:"Grams",
              kcal:"Kcal", protein_g:"Protein (g)", fat_g:"Fat (g)", carb_g:"Carb (g)"
            }
          )
        );
      } catch (e) {
        setHTML("mealSummaryResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }
}


//user plan
function setupPlan() {
  const btnPlan = $("btnPlan");
  if (!btnPlan) return;

  btnPlan.addEventListener("click", async () => {
    try {
      const u = getUser();
      if (!u) {
        setHTML("planResult", `<div class="small">Not logged in.</div>`);
        return;
      }
      const plan = await api(`/users/${u.id}/plan`);
      setHTML("planResult", renderPlan(plan));
    } catch (e) {
      setHTML("planResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
    }
  });
}


//admin panou
function setupAdmin() {
  const btnAdminLoadUsers = $("btnAdminLoadUsers");
  if (btnAdminLoadUsers) {
    btnAdminLoadUsers.addEventListener("click", async () => {
      try {
        const users = await apiAdmin("/admin/users");
        if (!users || users.length === 0) {
          setHTML("adminUsersResult", `<div class="small">No users.</div>`);
          return;
        }

        let html = `<table class="table"><thead><tr>
          <th>ID</th><th>Name</th><th>Sex</th><th>Age</th><th>Activity</th><th>Goal</th>
        </tr></thead><tbody>`;

        for (const u of users) {
          html += `<tr>
            <td>${escapeHtml(u.id)}</td>
            <td>${escapeHtml(u.name)}</td>
            <td>${escapeHtml(u.sex)}</td>
            <td>${escapeHtml(u.age)}</td>
            <td>${escapeHtml(u.activity)}</td>
            <td>${escapeHtml(u.goal)}</td>
          </tr>`;
        }

        html += `</tbody></table>`;
        setHTML("adminUsersResult", html);
      } catch (e) {
        setHTML("adminUsersResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }

  const btnAdminAddFood = $("btnAdminAddFood");
  if (btnAdminAddFood) {
    btnAdminAddFood.addEventListener("click", async () => {
      try {
        const payload = {
          name: ($("af_name")?.value || "").trim(),
          meal_type: ($("af_meal_type")?.value || "lunch").trim(),
          kcal_100g: Number($("af_kcal")?.value || 0),
          protein_100g: Number($("af_protein")?.value || 0),
          fat_100g: Number($("af_fat")?.value || 0),
          carb_100g: Number($("af_carb")?.value || 0),
        };

        if (!payload.name) {
          setHTML("adminFoodResult", `<div class="small">Name is required.</div>`);
          return;
        }

        // IMPORTANT: send JSON object; api() will set Content-Type properly now
        const food = await apiAdmin("/admin/foods", {
          method: "POST",
          body: payload,
        });

        setHTML(
          "adminFoodResult",
          renderKV(
            food,
            ["id","name","meal_type","kcal_100g","protein_100g","fat_100g","carb_100g"],
            {
              id:"ID", name:"Name", meal_type:"Meal type",
              kcal_100g:"kcal/100g", protein_100g:"P", fat_100g:"F", carb_100g:"C"
            }
          )
        );
      } catch (e) {
        setHTML("adminFoodResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }

  const btnAdminLoadFoods = $("btnAdminLoadFoods");
  if (btnAdminLoadFoods) {
    btnAdminLoadFoods.addEventListener("click", async () => {
      try {
        const foods = await apiAdmin("/admin/foods");
        setHTML("adminFoodsResult", renderFoodsTable(foods));
      } catch (e) {
        setHTML("adminFoodsResult", `<div class="small">Error: ${escapeHtml(e.message)}</div>`);
      }
    });
  }
}


window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupLogin();
  setupProfile();
  setupFoods();
  setupMeals();
  setupPlan();
  setupAdmin();

  logoutAll();
  clearAllResults();
  applyModeUI();
});
