<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Site Haritası - SQLLove</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                        color: #333;
                        font-size: 14px;
                        line-height: 1.6;
                        max-width: 75rem;
                        margin: 0 auto;
                        padding: 2rem;
                    }
                    a {
                        color: #ff6b6b;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th {
                        background-color: #ff6b6b;
                        color: white;
                        text-align: left;
                        padding: 0.75rem 1rem;
                    }
                    td {
                        padding: 0.75rem 1rem;
                        border-bottom: 1px solid #eaeaea;
                    }
                    tr:hover td {
                        background-color: #f8f8f8;
                    }
                    .header {
                        padding: 1rem 0;
                        border-bottom: 1px solid #eaeaea;
                        margin-bottom: 2rem;
                    }
                    .logo {
                        display: flex;
                        align-items: center;
                        font-weight: bold;
                        font-size: 1.5rem;
                        color: #ff6b6b;
                    }
                    .summary {
                        margin: 1rem 0 2rem;
                        font-style: italic;
                    }
				</style>
			</head>
			<body>
				<div class="header">
					<div class="logo">
						SQLLove Site Haritası
					</div>
				</div>
				<div class="summary">
					Bu XML site haritası, SQLLove'un tüm ana sayfalarını içerir ve arama motorları için optimize edilmiştir.
				</div>
				<div id="content">
					<table>
						<tr>
							<th>URL</th>
							<th>Son Güncelleme</th>
							<th>Değişim Sıklığı</th>
							<th>Öncelik</th>
						</tr>
						<xsl:for-each select="sitemap:urlset/sitemap:url">
							<tr>
								<td>
									<xsl:variable name="itemURL">
										<xsl:value-of select="sitemap:loc"/>
									</xsl:variable>
									<a href="{$itemURL}">
										<xsl:value-of select="sitemap:loc"/>
									</a>
								</td>
								<td>
									<xsl:value-of select="sitemap:lastmod"/>
								</td>
								<td>
									<xsl:value-of select="sitemap:changefreq"/>
								</td>
								<td>
									<xsl:value-of select="sitemap:priority"/>
								</td>
							</tr>
						</xsl:for-each>
					</table>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
