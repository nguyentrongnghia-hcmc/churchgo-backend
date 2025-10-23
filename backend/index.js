
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Cho phép frontend gọi tới
app.use(express.json()); // Đọc dữ liệu JSON

const CHURCHES_DATA_PATH = path.join(__dirname, '../data/churches.json');

// --- Helper Functions ---

// Đọc dữ liệu từ file
const readChurchesFromFile = () => {
    try {
        const data = fs.readFileSync(CHURCHES_DATA_PATH, 'utf8');
        // Chuyển đổi ID số thành chuỗi để nhất quán
        return JSON.parse(data).map(c => ({...c, id: String(c.id)}));
    } catch (error) {
        console.error("Error reading churches data file:", error);
        return []; // Trả về mảng rỗng nếu lỗi
    }
};

// Ghi dữ liệu vào file
const saveChurchesToFile = (churchesData) => {
    try {
        // Chuyển đổi media về định dạng imageUrl cũ để tương thích với file gốc
        const dataToSave = churchesData.map(church => {
            const { media, ...rest } = church;
            const imageUrl = media && media.length > 0 && media[0].type === 'image' ? media[0].url : '';
            // Cố gắng giữ lại ID số nếu có thể
            const idAsNumber = parseInt(rest.id.replace('mock_', '').replace('real_', ''));
            return {
                ...rest,
                id: isNaN(idAsNumber) ? rest.id : idAsNumber,
                imageUrl,
            };
        });

        fs.writeFileSync(CHURCHES_DATA_PATH, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing churches data file:", error);
    }
};

// --- API Endpoints ---

// 1. Lấy danh sách nhà thờ (có phân trang, tìm kiếm, sắp xếp)
app.get('/', (req, res) => {
    let filteredChurches = readChurchesFromFile();
    const { page = 1, limit = 12, searchTerm, sortKey, sortDirection } = req.query;

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filteredChurches = filteredChurches.filter(church =>
            church.name.toLowerCase().includes(lowercasedTerm) ||
            church.address.toLowerCase().includes(lowercasedTerm) ||
            church.diocese.toLowerCase().includes(lowercasedTerm)
        );
    }

    if (sortKey) {
        filteredChurches.sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            if (valA < valB) return sortDirection === 'ascending' ? -1 : 1;
            if (valA > valB) return sortDirection === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    const total = filteredChurches.length;
    const totalPages = Math.ceil(total / limit);
    const data = filteredChurches.slice((page - 1) * limit, page * limit);

    res.json({ data, total, totalPages });
});

// 2. Lấy TẤT CẢ nhà thờ (cho bản đồ)
app.get('/all', (req, res) => {
    const churches = readChurchesFromFile();
    // Chuyển đổi định dạng dữ liệu cho frontend
    const formattedChurches = churches.map(church => {
      const { imageUrl, ...rest } = church;
      const media = [];
      if (imageUrl) {
        media.push({
          id: `media_${String(church.id)}_1`,
          url: imageUrl,
          type: 'image',
        });
      }
      return {
        ...rest,
        id: String(church.id),
        media,
      };
    });
    res.json(formattedChurches);
});

// 3. Thêm nhà thờ mới
app.post('/', (req, res) => {
    const churches = readChurchesFromFile();
    const newChurchData = req.body;
    const newChurch = { ...newChurchData, id: `real_${Date.now()}` };
    churches.unshift(newChurch);
    saveChurchesToFile(churches);
    res.status(201).json(newChurch);
});

// 4. Cập nhật nhà thờ
app.put('/:id', (req, res) => {
    const churches = readChurchesFromFile();
    const { id } = req.params;
    const updatedData = req.body;
    const index = churches.findIndex(c => c.id === id);
    if (index > -1) {
        churches[index] = updatedData;
        saveChurchesToFile(churches);
        res.json(churches[index]);
    } else {
        res.status(404).json({ message: 'Church not found' });
    }
});

// 5. Xóa nhà thờ
app.delete('/:id', (req, res) => {
    let churches = readChurchesFromFile();
    const { id } = req.params;
    const initialLength = churches.length;
    churches = churches.filter(c => c.id !== id);
    if (churches.length < initialLength) {
        saveChurchesToFile(churches);
        res.status(204).send(); // No content
    } else {
        res.status(404).json({ message: 'Church not found' });
    }
});

// 6. Nhập hàng loạt
app.post('/bulk', (req, res) => {
    const churches = readChurchesFromFile();
    const newChurchesData = req.body;
    if (!Array.isArray(newChurchesData)) {
        return res.status(400).json({ message: 'Input must be an array of churches' });
    }
    const newChurches = newChurchesData.map(c => ({ ...c, id: `real_${Date.now()}_${Math.random()}` }));
    const updatedChurches = [...newChurches, ...churches];
    saveChurchesToFile(updatedChurches);
    res.status(201).json({ count: newChurches.length });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
