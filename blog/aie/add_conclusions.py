import os
import re

series_dir = os.path.dirname(os.path.abspath(__file__))

conclusions = {
    "aie-js-to-python.html": {
        "takeaways": [
            "Làm chủ cú pháp Python cơ bản và sự khác biệt về kiểu dữ liệu so với JavaScript.",
            "Biết cách thiết lập môi trường ảo <code>venv</code> và quản lý thư viện bằng <code>pip</code> thay thế cho <code>npm</code>/<code>node_modules</code>."
        ],
        "next_step": "Có được tư duy viết mã Python, bài học tiếp theo sẽ đưa ta bước vào thế giới toán học nền tảng của Trí tuệ nhân tạo: các phép toán Vector, Ma trận và Đạo hàm được lập trình trực quan bằng Python thuần túy."
    },
    "aie-math-code.html": {
        "takeaways": [
            "Hiểu rõ bản chất hình học của Vector, Ma trận và phép nhân ma trận trong không gian đa chiều.",
            "Làm chủ khái niệm Đạo hàm (Derivatives) và Gradient Descent - chìa khóa vạn năng giúp các thuật toán AI tự học cách làm mịn sai số."
        ],
        "next_step": "Để tăng hiệu năng tính toán ma trận lên hàng triệu phép tính mỗi giây mà không bị nghẽn CPU, chúng ta cần học cách song song hóa dữ liệu với hai thư viện cốt lõi NumPy và Pandas ở Bài số 3."
    },
    "aie-numpy-pandas.html": {
        "takeaways": [
            "Làm chủ kỹ thuật Vectorization để song song hóa tính toán mảng nhiều chiều với NumPy, tối ưu hóa bộ đệm cache.",
            "Thao tác làm sạch, xử lý và trích xuất dữ liệu lớn hiệu quả bằng bảng DataFrame của Pandas."
        ],
        "next_step": "NumPy rất mạnh trên CPU, nhưng để huấn luyện các mạng nơ-ron sâu phức tạp trên chip đồ họa GPU, chúng ta cần chuyển giao diện sang thư viện chuyên dụng PyTorch và cơ chế tính toán đạo hàm tự động Autograd ở Bài số 4."
    },
    "aie-pytorch-autograd.html": {
        "takeaways": [
            "Hiểu bản chất cấu trúc dữ liệu Tensor của PyTorch và cách nó tăng tốc song song trên GPU.",
            "Nắm vững cơ chế đồ thị tính toán (Computation Graph) và tính đạo hàm tự động Autograd để lan truyền lỗi."
        ],
        "next_step": "Từ các viên gạch Tensor đơn lẻ này, ở Bài số 5 chúng ta sẽ chính thức lắp ráp chúng lại để tạo nên mô hình Mạng Nơ-ron đa lớp đầu tiên (MLP) hoàn chỉnh."
    },
    "aie-mlp-neural-network.html": {
        "takeaways": [
            "Nắm vững cấu trúc mạng Perceptron và mạng truyền thẳng đa lớp MLP.",
            "Hiểu rõ vai trò của các hàm kích hoạt phi tuyến (ReLU, Sigmoid) giúp mạng nơ-ron học các biên phân loại phi tuyến phức tạp."
        ],
        "next_step": "Mô hình mạng MLP đã thiết kế xong nhưng chưa thể tự học. Ở Bài số 6, chúng ta sẽ viết vòng lặp huấn luyện (Training Loop) sử dụng thuật toán lan truyền ngược Backpropagation để cập nhật trọng số cho mạng."
    },
    "aie-training-backprop.html": {
        "takeaways": [
            "Tự lập trình vòng lặp huấn luyện (Training Loop), tính toán sai số bằng Loss Function.",
            "Làm chủ thuật toán lan truyền ngược Backpropagation để tự động cập nhật trọng số cho mạng nơ-ron."
        ],
        "next_step": "Mạng MLP xử lý dữ liệu phẳng rất tốt, nhưng với dữ liệu không gian dạng hình ảnh, ta cần một cấu trúc mạng tối ưu hơn là Mạng tích chập CNN ở Bài số 7."
    },
    "aie-cnn-convolution.html": {
        "takeaways": [
            "Nắm vững cơ chế trượt bộ lọc ảnh (Kernel) và lớp Pooling giảm chiều trong mạng tích chập CNN.",
            "Huấn luyện thành công mạng CNN nhận diện chữ số viết tay MNIST với độ chính xác cao."
        ],
        "next_step": "Đã làm chủ xử lý hình ảnh, bước tiếp theo chúng ta sẽ tiến quân sang thế giới tự nhiên của ngôn ngữ: cách chuyển hóa từ vựng thành các vector đặc trưng trong không gian ngữ nghĩa Word Embeddings ở Bài số 8."
    },
    "aie-text-embeddings.html": {
        "takeaways": [
            "Hiểu cách Tokenization chia nhỏ văn bản và cách thuật toán Word2Vec nhúng từ vựng vào không gian vector đa chiều.",
            "Tự lập trình bộ tìm kiếm từ đồng nghĩa dựa trên khoảng cách Cosine Similarity giữa các vector embeddings."
        ],
        "next_step": "Các vector từ đơn lẻ chưa thể hiện được thứ tự của câu văn. Để xử lý các chuỗi ngôn ngữ dài theo thời gian, chúng ta cần cơ chế mạng tuần hoàn RNN và cơ chế Attention ở Bài số 9."
    },
    "aie-rnn-attention.html": {
        "takeaways": [
            "Hiểu cơ chế nhớ chuỗi của mạng RNN/LSTM và cạm bẫy tiêu biến gradient khi xử lý văn bản dài.",
            "Làm chủ ý tưởng đột phá của cơ chế Chú ý (Attention Mechanism) giúp mô hình tập trung vào các từ khóa quan trọng."
        ],
        "next_step": "Loại bỏ hoàn toàn tính tuần hoàn chậm chạp của RNN, cơ chế Attention đã khai sinh ra kiến trúc Transformer huyền thoại - động cơ của mọi LLM lớn hiện nay - mà ta sẽ giải phẫu ở Bài số 10."
    },
    "aie-transformer-mechanism.html": {
        "takeaways": [
            "Giải phẫu chi tiết cơ chế Self-Attention và Multi-Head Attention trong Transformer.",
            "Hiểu rõ cấu trúc song song hóa khối Encoder-Decoder làm nền móng cho các siêu mô hình ngôn ngữ lớn (LLM)."
        ],
        "next_step": "Sau khi đã hiểu cấu tạo phần cứng bên trong LLM, chúng ta sẽ bắt đầu học cách lập trình tương tác với các LLM đã được huấn luyện thông qua API và các kỹ thuật Prompt Engineering ở Bài số 11."
    },
    "aie-llm-api-prompting.html": {
        "takeaways": [
            "Làm chủ cách tùy biến tham số Temperature, Top-P của LLM và thiết kế prompt hệ thống (System Prompt).",
            "Xây dựng thành công chatbot ghi nhớ ngữ cảnh hội thoại sử dụng API của các mô hình thương mại."
        ],
        "next_step": "Để kết quả trả về của LLM không chỉ là văn bản tự do mà có cấu trúc chuẩn hóa cho ứng dụng Web đọc được, chúng ta cần tìm hiểu chế độ JSON Mode và Function Calling ở Bài số 12."
    },
    "aie-structured-output-tools.html": {
        "takeaways": [
            "Ép LLM sinh đầu ra có cấu trúc chuẩn xác theo JSON Schema định nghĩa sẵn.",
            "Làm chủ cơ chế gọi hàm (Function Calling) giúp LLM tự động kích hoạt các công cụ và kết nối với cơ sở dữ liệu."
        ],
        "next_step": "Việc gọi API của OpenAI/Gemini rất tốn phí. Để làm chủ dòng chảy dữ liệu nội bộ và bảo mật tuyệt đối, chúng ta cần học cách chạy các LLM cục bộ (Local LLM) qua Ollama ở Bài số 13."
    },
    "aie-local-llm-ollama.html": {
        "takeaways": [
            "Chạy mô hình ngôn ngữ lớn offline 100% trên máy cá nhân bằng Ollama.",
            "Quản lý hiệu quả tài nguyên RAM/VRAM và giao tiếp API cục bộ với các ứng dụng bên ngoài."
        ],
        "next_step": "Chạy được mô hình offline, làm sao để nạp hàng ngàn trang tài liệu PDF nội bộ cho mô hình trả lời? Câu trả lời chính là kiến trúc RAG (Retrieval-Augmented Generation) cơ bản ở Bài số 14."
    },
    "aie-rag-basics.html": {
        "takeaways": [
            "Hiểu kiến trúc một hệ thống RAG cơ bản: Chia nhỏ tài liệu -> Embedding -> Lưu Vector DB -> Truy xuất ngữ nghĩa -> Nhồi Context vào Prompt sinh câu trả lời.",
            "Tự lập trình thành công hệ thống hỏi đáp tài liệu PDF offline sử dụng mô hình local."
        ],
        "next_step": "Trong thực tế, việc cắt đoạn thô sơ sẽ làm mất mát ngữ cảnh. Ở Bài số 15, chúng ta sẽ nghiên cứu chuyên sâu các chiến thuật cắt đoạn (Chunking) nâng cao và cấu trúc tìm kiếm nhanh của Vector DB."
    },
    "aie-chunking-vector-db.html": {
        "takeaways": [
            "Làm chủ các kỹ thuật phân đoạn nâng cao như Recursive Character và Semantic Chunking dựa trên mật độ ngữ nghĩa.",
            "Hiểu cơ chế chỉ mục đồ thị HNSW giúp tìm kiếm hàng triệu vector trong mili-giây."
        ],
        "next_step": "Khi câu hỏi của người dùng mơ hồ hoặc tài liệu dài bị loãng, RAG cơ bản sẽ tìm sai tài liệu. Chúng ta cần các kỹ thuật tối ưu Query Rewrite và Reranking ở Bài số 16."
    },
    "aie-advanced-rag.html": {
        "takeaways": [
            "Triển khai hệ thống RAG nâng cao với cơ chế viết lại câu hỏi (Query Translation).",
            "Nén tài liệu truy xuất và tái sắp xếp kết quả bằng Cross-Encoder (Rerank) để tăng độ chính xác."
        ],
        "next_step": "RAG chỉ giúp mô hình đọc tài liệu thụ động. Để mô hình có thể tự suy luận, lập kế hoạch hành động và sử dụng các công cụ linh hoạt như con người, chúng ta bước vào thế giới của AI Agents và vòng lặp ReAct ở Bài số 17."
    },
    "aie-agents-react.html": {
        "takeaways": [
            "Hiểu bản chất vòng lặp suy luận ReAct (Reason + Act) giúp LLM tự động phân tích yêu cầu.",
            "Lập trình thành công AI Agent tự đưa ra quyết định chọn công cụ phù hợp và tự sửa lỗi đầu vào."
        ],
        "next_step": "Vòng lặp ReAct tuần tự rất dễ bị rơi vào vòng lặp vô hạn hoặc khó quản lý luồng rẽ nhánh phức tạp. Chúng ta sẽ nâng cấp lên thiết kế đại lý dạng đồ thị có trạng thái bằng LangGraph ở Bài số 18."
    },
    "aie-langgraph-stateful-agents.html": {
        "takeaways": [
            "Thiết kế luồng xử lý Agent dưới dạng đồ thị có trạng thái (State Graph) bằng LangGraph.",
            "Quản lý State tập trung và tích hợp cơ chế con người kiểm duyệt (Human-in-the-loop) để tăng độ an toàn."
        ],
        "next_step": "Đối với những bài toán chuyên biệt cần giọng điệu hoặc tri thức đặc thù mà RAG và Prompting không giải quyết triệt để, chúng ta cần tinh chỉnh trực tiếp vào trọng số mô hình bằng kỹ thuật Fine-tuning & LoRA ở Bài số 19."
    },
    "aie-fine-tuning-lora.html": {
        "takeaways": [
            "Hiểu bản chất toán học đằng sau kỹ thuật LoRA đóng băng ma trận gốc và tối ưu ma trận hạng thấp song song.",
            "Tự viết luồng huấn luyện giả lập LoRA bằng NumPy từ số 0 để cập nhật trọng số."
        ],
        "next_step": "Sau khi mô hình đã được tinh chỉnh, bước cuối cùng là serving mô hình hiệu năng cao trên production, giám sát tracing luồng chạy và đánh giá tự động hệ thống qua Bài số 20 (MLOps)."
    },
    "aie-mlops-eval.html": {
        "takeaways": [
            "Làm chủ cơ chế PagedAttention của vLLM để tối ưu hóa bộ nhớ đệm KV Cache phục vụ tải lớn.",
            "Thiết lập bộ chỉ số đánh giá RAG tự động bằng Ragas và giám sát gỡ lỗi Agent bằng Phoenix Tracing."
        ],
        "next_step": "Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ lộ trình 20 bài học của Kỹ Sư AI Thực Chiến! Hành trình tiếp theo của bạn là ứng dụng những kiến thức nền tảng này để xây dựng các giải pháp AI độc lập, đóng góp vào cộng đồng và không ngừng học hỏi trước làn sóng công nghệ mới."
    }
}

for filename, data in conclusions.items():
    filepath = os.path.join(series_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check if conclusion section already exists
    if "<h2>Tóm tắt bài học" in content:
        print(f"Conclusion already exists in {filename}, skipping.")
        continue
        
    # Build conclusion HTML block
    li_items = "\n".join([f"                  <li><strong>Đạt được:</strong> {item}</li>" for item in data["takeaways"]])
    conclusion_html = f"""            <h2>Tóm tắt bài học &amp; Cầu nối kiến thức</h2>
            <div class="callout callout--note">
              <div class="callout__title">🔑 Bài học đạt được:</div>
              <div class="callout__content">
                <ul style="margin: 0; padding-left: 20px;">
{li_items}
                </ul>
              </div>
            </div>
            <p style="margin-top: 16px;">
              <strong>Cầu nối bài tiếp theo:</strong> {data["next_step"]}
            </p>

"""
    
    # We will insert it right before <div class="article-cta">
    target = '<div class="article-cta">'
    if target in content:
        parts = content.split(target, 1)
        # Check indentation of the line where <div class="article-cta"> was
        # Let's align with the indent. Standard is 12 spaces.
        new_content = parts[0] + conclusion_html + "            " + target + parts[1]
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Added conclusion to {filename} successfully.")
    else:
        print(f"Target div not found in {filename}!")
