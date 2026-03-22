import { auth, provider, db } from "./firebase.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, onSnapshot, updateDoc, doc, getDoc, deleteDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const dashboard = document.getElementById("dashboard");
const sidebar = document.getElementById("sidebar");

/* 🔐 ADMIN LOGIN */
window.adminLogin = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    const adminEmail = res.user.email;

    const adminDoc = await getDoc(doc(db, "admins", adminEmail));
    if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
      alert("❌ Access Denied: You are not a registered admin.");
      await auth.signOut();
      return;
    }

    loginBtn.classList.add("hidden");
    dashboard.classList.remove("hidden");
    sidebar.classList.remove("hidden");
    sidebar.classList.add("flex");

    initAdminListeners();
  } catch (e) {
    alert("Login failed: " + e.message);
  }
};

/* 🔄 TAB SWITCHING */
window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
};

function initAdminListeners() {
    // 📝 Posts Listener
    onSnapshot(collection(db, "posts"), snap => {
        const list = document.getElementById("postsList");
        let activeCount = 0;
        list.innerHTML = "";
        snap.forEach(d => {
            const p = d.data();
            if(p.status === 'active') activeCount++;
            list.innerHTML += `
            <div class="bg-gray-900 p-4 rounded-xl border ${p.blocked ? 'border-red-500' : 'border-gray-800'} flex justify-between">
                <div>
                    <h3 class="font-bold">${p.title} <span class="text-xs font-normal opacity-50">(${p.category})</span></h3>
                    <p class="text-indigo-400 font-bold">₹${p.price}</p>
                    <p class="text-xs opacity-60">By: ${p.sellerName} (${p.sellerEmail})</p>
                </div>
                <div class="flex gap-2 items-center">
                    <button onclick="updatePostStatus('${d.id}', 'active')" class="bg-green-600 px-3 py-1 rounded text-xs">Approve</button>
                    <button onclick="toggleBlockPost('${d.id}', ${p.blocked})" class="bg-yellow-600 px-3 py-1 rounded text-xs">${p.blocked ? 'Unblock' : 'Block'}</button>
                    <button onclick="deleteDocById('posts', '${d.id}')" class="bg-red-600 px-3 py-1 rounded text-xs">Del</button>
                </div>
            </div>`;
        });
        document.getElementById("stat-posts").innerText = activeCount;
    });

    // 📦 Orders Listener
    onSnapshot(collection(db, "orders"), snap => {
        const table = document.getElementById("ordersTable");
        let revenue = 0;
        table.innerHTML = "";
        snap.forEach(d => {
            const o = d.data();
            if(o.status === "Completed") revenue += Number(o.price);
            table.innerHTML += `
            <tr class="border-b border-gray-800 text-sm">
                <td class="p-4">${o.itemTitle}</td>
                <td>${o.buyerName}</td>
                <td>${o.sellerName}</td>
                <td><span class="bg-gray-800 px-2 py-1 rounded text-[10px]">${o.status}</span></td>
                <td class="p-4 flex gap-2">
                 <button onclick="updateOrderStatus('${d.id}','accepted')" class="text-green-400">Accept</button>
                 <button onclick="updateOrderStatus('${d.id}','completed')" class="text-blue-400">Complete</button>
                 <button onclick="deleteDocById('orders','${d.id}')" class="text-red-400">Delete</button>
                 </td>
            </tr>`;
        });
        document.getElementById("stat-revenue").innerText = "₹" + revenue;
        document.getElementById("stat-orders").innerText = snap.size;
    });

    // 🏠 Home Ad
    onSnapshot(doc(db, "config", "homeAd"), d => {
        if (d.exists()) document.getElementById("adText").value = d.data().text;
    });
}

/* ⚙️ ACTIONS */
window.updatePostStatus = async (id, status) => {
    await updateDoc(doc(db, "posts", id), { status: status, blocked: false });
};

window.toggleBlockPost = async (id, current) => {
    await updateDoc(doc(db, "posts", id), { blocked: !current });
};

window.updateOrderStatus = async (id, status) => {
  await updateDoc(doc(db, "orders", id), {
    status,
    paymentStatus: status === "completed" ? "success" : "pending"
  });
};

window.deleteDocById = async (col, id) => {
    if(confirm("Permanent Delete?")) await deleteDoc(doc(db, col, id));
};

window.updateAd = async () => {
  await updateDoc(doc(db, "config", "homeAd"), {
    text: document.getElementById("adText").value
  });
  alert("System config updated.");
};

window.blockUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), {
    blocked: true
  });
};

// 🔹 Categories Listener
onSnapshot(collection(db, "categories"), snap => {
  const list = document.getElementById("categoriesList");
  list.innerHTML = "";
  snap.forEach(d => {
    const cat = d.data();
    list.innerHTML += `
      <div class="bg-gray-800 p-3 rounded flex justify-between items-center">
        <span>${cat.name} ${cat.active ? '(Active)' : '(Inactive)'}</span>
        <div class="flex gap-2">
          <button onclick="toggleCategory('${d.id}', ${cat.active})" class="bg-yellow-600 px-2 py-1 rounded text-xs">
            ${cat.active ? 'Deactivate' : 'Activate'}
          </button>
          <button onclick="deleteCategory('${d.id}')" class="bg-red-600 px-2 py-1 rounded text-xs">Delete</button>
        </div>
      </div>`;
  });
});

// Add Category
window.addCategory = async () => {
  const name = document.getElementById("newCategoryName").value.trim();
  if(!name) return alert("Enter category name");
  await setDoc(doc(db, "categories", name), { name, active: true });
  document.getElementById("newCategoryName").value = "";
};

// Toggle Active/Inactive
window.toggleCategory = async (id, current) => {
  await updateDoc(doc(db, "categories", id), { active: !current });
};

// Delete Category
window.deleteCategory = async (id) => {
  if(confirm("Delete this category?")) await deleteDoc(doc(db, "categories", id));
};

// 🔹 Accounts Listener
onSnapshot(collection(db, "users"), snap => {
  const table = document.getElementById("accountsTable");
  table.innerHTML = "";
  snap.forEach(d => {
    const u = d.data();
    table.innerHTML += `
      <tr class="border-b border-gray-800 text-sm">
        <td class="p-4">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.totalOrders || 0}</td>
        <td>₹${u.totalPaid || 0}</td>
        <td class="p-4 flex gap-2">
          <button onclick="viewAccount('${d.id}')" class="text-blue-400">View</button>
          <button onclick="toggleUserRole('${d.id}', '${u.role}')" class="text-green-400">${u.role === 'user' ? 'Promote' : 'Demote'}</button>
          <button onclick="blockUser('${d.id}')" class="text-red-400">${u.blocked ? 'Unblock' : 'Block'}</button>
        </td>
      </tr>`;
  });
});

// Toggle Role
window.toggleUserRole = async (uid, role) => {
  const newRole = role === 'user' ? 'admin' : 'user';
  await updateDoc(doc(db, "users", uid), { role: newRole });
};

// View Account (simple alert for now, can expand later)
window.viewAccount = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  if(docSnap.exists()) {
    const u = docSnap.data();
    alert(JSON.stringify(u, null, 2));
  }
};
