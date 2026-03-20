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
