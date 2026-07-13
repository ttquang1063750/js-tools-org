<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
                exclude-result-prefixes="s">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="vi">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sơ đồ trang Web (XML Sitemap) — js-tools.org</title>
        <style>
          :root {
            --bg: #1e1e2e;
            --mantle: #181825;
            --base: #11111b;
            --text: #cdd6f4;
            --subtext: #a6adc8;
            --blue: #89b4fa;
            --peach: #fab387;
            --green: #a6e3a1;
            --mauve: #cba6f7;
            --border: #313244;
            --surface: #45475a;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.5;
            padding: 40px 20px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          header {
            margin-bottom: 30px;
            padding: 24px;
            background-color: var(--mantle);
            border: 1px solid var(--border);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .brand img {
            height: 32px;
          }

          .brand h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .brand span {
            color: var(--peach);
          }

          header p {
            color: var(--subtext);
            font-size: 14px;
            margin-bottom: 16px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 20px;
          }

          .stat-card {
            background-color: var(--base);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }

          .stat-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--subtext);
            margin-bottom: 8px;
          }

          .stat-card p {
            font-size: 28px;
            font-weight: 700;
            color: var(--blue);
            margin: 0;
          }

          .stat-card p.total-count {
            color: var(--green);
          }

          .control-panel {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            align-items: center;
          }

          .search-box {
            flex: 1;
            min-width: 280px;
            position: relative;
          }

          .search-box input {
            width: 100%;
            padding: 12px 16px;
            background-color: var(--mantle);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }

          .search-box input:focus {
            border-color: var(--blue);
          }

          .filter-btn-group {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .filter-btn {
            background-color: var(--mantle);
            border: 1px solid var(--border);
            color: var(--subtext);
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-btn:hover {
            color: var(--text);
            border-color: var(--subtext);
          }

          .filter-btn.active {
            background-color: var(--blue);
            border-color: var(--blue);
            color: var(--base);
          }

          .table-wrapper {
            background-color: var(--mantle);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
          }

          th {
            background-color: var(--base);
            padding: 16px 20px;
            font-weight: 700;
            color: var(--subtext);
            border-bottom: 1px solid var(--border);
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }

          td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            word-break: break-all;
          }

          tr:last-child td {
            border-bottom: none;
          }

          tr:hover td {
            background-color: rgba(255, 255, 255, 0.02);
          }

          .url-link {
            color: var(--blue);
            text-decoration: none;
            font-weight: 500;
          }

          .url-link:hover {
            text-decoration: underline;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .badge-freq {
            background-color: var(--surface);
            color: var(--text);
          }

          .badge-freq.weekly {
            background-color: rgba(137, 180, 250, 0.15);
            color: var(--blue);
          }

          .badge-freq.monthly {
            background-color: rgba(203, 166, 247, 0.15);
            color: var(--mauve);
          }

          .badge-priority {
            font-family: monospace;
            background-color: rgba(166, 227, 161, 0.15);
            color: var(--green);
          }

          .badge-priority.high {
            background-color: rgba(250, 179, 135, 0.15);
            color: var(--peach);
          }

          .lastmod-text {
            color: var(--subtext);
            font-size: 13px;
          }

          .no-results {
            padding: 40px;
            text-align: center;
            color: var(--subtext);
            display: none;
          }

          @media (max-width: 768px) {
            body {
              padding: 20px 10px;
            }

            header {
              padding: 16px;
            }

            th, td {
              padding: 12px 10px;
            }

            th:nth-child(3), td:nth-child(3) {
              display: none; /* Hide changefreq on mobile to fit screen */
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div class="brand">
              <h1>
                <a href="/"><img src="/assets/logo.svg" alt="js-tools Logo"/></a>
              </h1>
            </div>
            <p>
              Đây là sơ đồ trang XML (XML Sitemap) tự động tạo để hỗ trợ các công cụ tìm kiếm như Google, Bing, Yandex khám phá các liên kết trên website.
              Sử dụng XSLT để hiển thị trực quan thông tin chi tiết từng URL dưới định dạng con người có thể đọc được.
            </p>
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Tổng số liên kết</h3>
                <p class="total-count" id="stat-total">0</p>
              </div>
              <div class="stat-card">
                <h3>Bài viết &amp; Lộ trình</h3>
                <p id="stat-blog">0</p>
              </div>
              <div class="stat-card">
                <h3>Độ ưu tiên cao</h3>
                <p id="stat-high">0</p>
              </div>
            </div>
          </header>

          <div class="control-panel">
            <div class="search-box">
              <input type="text" id="search-input" placeholder="Tìm kiếm đường dẫn (URL)..." onkeyup="filterUrls()"/>
            </div>
            <div class="filter-btn-group">
              <button class="filter-btn active" id="btn-all" onclick="setCategory('all')">Tất cả</button>
              <button class="filter-btn" id="btn-core" onclick="setCategory('core')">Trang chính</button>
              <button class="filter-btn" id="btn-blog" onclick="setCategory('blog')">Blog</button>
              <button class="filter-btn" id="btn-vlsi" onclick="setCategory('vlsi')">VLSI &amp; FPGA</button>
              <button class="filter-btn" id="btn-electronics" onclick="setCategory('electronics')">Điện tử</button>
            </div>
          </div>

          <div class="table-wrapper">
            <table id="sitemap-table">
              <thead>
                <tr>
                  <th style="width: 55%">Đường dẫn (URL)</th>
                  <th style="width: 15%; text-align: center">Độ ưu tiên</th>
                  <th style="width: 15%; text-align: center">Tần suất quét</th>
                  <th style="width: 15%; text-align: center">Cập nhật cuối</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <xsl:sort select="s:priority" data-type="number" order="descending"/>
                  <tr class="sitemap-row">
                    <td>
                      <a class="url-link" href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td style="text-align: center">
                      <xsl:variable name="pVal" select="number(s:priority)"/>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:text>badge badge-priority</xsl:text>
                          <xsl:if test="$pVal &gt;= 0.8">
                            <xsl:text> high</xsl:text>
                          </xsl:if>
                        </xsl:attribute>
                        <xsl:value-of select="format-number(s:priority, '0.0')"/>
                      </span>
                    </td>
                    <td style="text-align: center">
                      <span>
                        <xsl:attribute name="class">
                          <xsl:text>badge badge-freq </xsl:text>
                          <xsl:value-of select="s:changefreq"/>
                        </xsl:attribute>
                        <xsl:choose>
                          <xsl:when test="s:changefreq = 'daily'">Hằng ngày</xsl:when>
                          <xsl:when test="s:changefreq = 'weekly'">Hằng tuần</xsl:when>
                          <xsl:when test="s:changefreq = 'monthly'">Hằng tháng</xsl:when>
                          <xsl:otherwise><xsl:value-of select="s:changefreq"/></xsl:otherwise>
                        </xsl:choose>
                      </span>
                    </td>
                    <td style="text-align: center">
                      <span class="lastmod-text">
                        <xsl:choose>
                          <xsl:when test="s:lastmod">
                            <xsl:value-of select="s:lastmod"/>
                          </xsl:when>
                          <xsl:otherwise>—</xsl:otherwise>
                        </xsl:choose>
                      </span>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
            <div class="no-results" id="no-results-msg">
              Không tìm thấy đường dẫn phù hợp với tiêu chí lọc.
            </div>
          </div>
        </div>

        <script>
          let currentCategory = 'all';

          function updateStats() {
            const rows = document.querySelectorAll('.sitemap-row');
            let total = 0;
            let blog = 0;
            let high = 0;

            rows.forEach(row => {
              total++;
              const url = row.querySelector('.url-link').href;
              const priorityText = row.querySelector('.badge-priority').textContent.trim();
              const priority = parseFloat(priorityText);

              if (url.includes('/blog/')) {
                blog++;
              }
              if (priority &gt;= 0.8) {
                high++;
              }
            });

            document.getElementById('stat-total').textContent = total;
            document.getElementById('stat-blog').textContent = blog;
            document.getElementById('stat-high').textContent = high;
          }

          function setCategory(cat) {
            currentCategory = cat;
            document.querySelectorAll('.filter-btn').forEach(btn => {
              btn.classList.toggle('active', btn.id === 'btn-' + cat);
            });
            filterUrls();
          }

          function filterUrls() {
            const query = document.getElementById('search-input').value.toLowerCase().trim();
            const rows = document.querySelectorAll('.sitemap-row');
            let visibleCount = 0;

            rows.forEach(row => {
              const url = row.querySelector('.url-link').href.toLowerCase();
              let matchesCat = false;

              if (currentCategory === 'all') {
                matchesCat = true;
              } else if (currentCategory === 'core') {
                matchesCat = !url.includes('/blog/');
              } else if (currentCategory === 'blog') {
                matchesCat = url.includes('/blog/') &amp;&amp; !url.includes('/blog/vlsi/') &amp;&amp; !url.includes('/blog/electronics/');
              } else if (currentCategory === 'vlsi') {
                matchesCat = url.includes('/blog/vlsi/');
              } else if (currentCategory === 'electronics') {
                matchesCat = url.includes('/blog/electronics/');
              }

              const matchesSearch = url.includes(query);

              if (matchesCat &amp;&amp; matchesSearch) {
                row.style.display = '';
                visibleCount++;
              } else {
                row.style.display = 'none';
              }
            });

            document.getElementById('no-results-msg').style.display = visibleCount === 0 ? 'block' : 'none';
          }

          // Delay execution to let layout load
          setTimeout(updateStats, 100);
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
