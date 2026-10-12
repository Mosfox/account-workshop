const message = document.querySelector('#message');
const userTable = document.querySelector('#user-table');

// แสดงข้อความแจ้งเตือน
function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = isError ? 'error' : 'success';
}

// ส่งข้อมูล JSON ด้วย POST
async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return {
        ok: res.ok,
        body: await res.json()
    };
}

// สมัครสมาชิก
document.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    try {
        const { ok, body } = await postJSON('/api/register', data);

        if (ok) {
            showMessage(`สมัครสมาชิกสำเร็จ ยินดีต้อนรับคุณ ${body.name}`);
            form.reset();
            await loadUsers();
        } else {
            showMessage(body.error || 'สมัครสมาชิกไม่สำเร็จ', true);
        }
    } catch (error) {
        showMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', true);
        console.error(error);
    }
});

// เข้าสู่ระบบ
document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target));

    try {
        const { ok, body } = await postJSON('/api/login', data);

        if (ok) {
            showMessage(
                `เข้าสู่ระบบสำเร็จ สวัสดีคุณ ${body.user.name} (${body.user.role})`
            );
        } else {
            showMessage(body.error || 'เข้าสู่ระบบไม่สำเร็จ', true);
        }
    } catch (error) {
        showMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', true);
        console.error(error);
    }
});

// โหลดรายชื่อสมาชิกจาก API
async function loadUsers() {
    try {
        const res = await fetch('/api/users');

        if (!res.ok) {
            throw new Error('ไม่สามารถโหลดรายชื่อสมาชิกได้');
        }

        const users = await res.json();
        userTable.innerHTML = '';

        for (const user of users) {
            const tr = document.createElement('tr');

            for (const value of [
                user.username,
                user.name,
                user.email,
                user.role
            ]) {
                const td = document.createElement('td');
                td.textContent = value ?? '';
                tr.appendChild(td);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'ลบ';
            deleteBtn.addEventListener('click', () => {
                deleteUser(user.username);
            });

            const td = document.createElement('td');
            td.appendChild(deleteBtn);
            tr.appendChild(td);

            userTable.appendChild(tr);
        }
    } catch (error) {
        showMessage('ไม่สามารถโหลดรายชื่อสมาชิกได้', true);
        console.error(error);
    }
}

// ลบบัญชีสมาชิก
async function deleteUser(username) {
    if (!confirm(`ต้องการลบบัญชี ${username} ใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch(
            `/api/users/${encodeURIComponent(username)}`,
            { method: 'DELETE' }
        );

        const body = await res.json();

        if (res.ok) {
            showMessage(`ลบบัญชี ${username} เรียบร้อยแล้ว`);
            await loadUsers();
        } else {
            showMessage(body.error || 'ลบบัญชีไม่สำเร็จ', true);
        }
    } catch (error) {
        showMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', true);
        console.error(error);
    }
}

// โหลดรายชื่อสมาชิกเมื่อเปิดหน้าเว็บ
loadUsers();
