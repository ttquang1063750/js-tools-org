import numpy as np

def generate_dummy_images(num_images=100, height=28, width=28):
    # Tạo dữ liệu ảnh giả lập ngẫu nhiên với phân phối nguyên (0-255)
    # Giả lập ảnh có độ sáng và nhiễu khác nhau
    np.random.seed(42)
    raw_data = np.random.randint(0, 256, size=(num_images, height, width), dtype=np.uint8)
    return raw_data

def preprocess_images(images):
    # Kiểm tra kiểu dữ liệu đầu vào
    if not isinstance(images, np.ndarray):
        raise TypeError("Dữ liệu đầu vào phải là một mảng NumPy ndarray!")
        
    # Chuyển đổi kiểu dữ liệu sang float32 để tính toán độ chính xác cao
    images_float = images.astype(np.float32)
    
    # 1. Tính toán thống kê toàn cục sử dụng vectorization (không dùng vòng lặp for)
    global_mean = np.mean(images_float)
    
    # Đối với Min-Max Scaling chuẩn hóa về [0, 1]:
    # X_normalized = (X - X_min) / (X_max - X_min)
    img_min = np.min(images_float)
    img_max = np.max(images_float)
    
    range_val = img_max - img_min
    if range_val == 0:
        range_val = 1.0
        
    normalized_images = (images_float - img_min) / range_val
    
    # 2. Tính toán Z-score Normalization để minh họa:
    # X_zscore = (X - mean) / std
    std_val = np.std(images_float)
    if std_val == 0:
        std_val = 1.0
    zscore_images = (images_float - global_mean) / std_val
    
    return normalized_images, zscore_images, global_mean, std_val

if __name__ == "__main__":
    print("=== Khởi tạo dữ liệu ảnh giả lập ===")
    raw_images = generate_dummy_images(num_images=10, height=28, width=28)
    print(f"Kích thước tập dữ liệu: {raw_images.shape} (Batch x Height x Width)")
    print(f"Giá trị pixel lớn nhất ban đầu: {np.max(raw_images)}")
    print(f"Giá trị pixel nhỏ nhất ban đầu: {np.min(raw_images)}")
    
    print("\n=== Đang tiến hành tiền xử lý và chuẩn hóa Vectorized (NumPy) ===")
    norm_imgs, z_imgs, mean, std = preprocess_images(raw_images)
    
    print(f"Giá trị trung bình toàn cục (Mean): {mean:.4f}")
    print(f"Độ lệch chuẩn toàn cục (Std): {std:.4f}")
    
    print("\n=== Kết quả sau chuẩn hóa Min-Max [0, 1] ===")
    print(f"Kích thước mảng kết quả: {norm_imgs.shape}")
    print(f"Giá trị nhỏ nhất sau Min-Max: {np.min(norm_imgs):.4f}")
    print(f"Giá trị lớn nhất sau Min-Max: {np.max(norm_imgs):.4f}")
    
    print("\n=== Kết quả sau chuẩn hóa Z-score (Mean=0, Std=1) ===")
    print(f"Giá trị trung bình mới: {np.mean(z_imgs):.4f} (Mong đợi: ~0.0)")
    print(f"Độ lệch chuẩn mới: {np.std(z_imgs):.4f} (Mong đợi: ~1.0)")
