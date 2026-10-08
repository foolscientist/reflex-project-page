# ReFlex 英文主页：预览与发布

网页已经是可发布的英文版，所有图片、视频、公式库、字体和当前论文 PDF 均已打包。
发布静态网页不需要运行 MuJoCo，也不需要安装 Node.js。

## 本地预览

在 Anaconda Prompt 或 VS Code 的 Anaconda 终端执行：

```bat
cd /d "D:\workFileRecord\paper\Reflex(Feedback-Enhanced ReKep for Robotic Manipulation)\vsshRe"
conda activate mujoco_py310
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

浏览器打开 **http://127.0.0.1:8000/**。停止预览时按 `Ctrl+C`。
如果 8000 端口正在使用，把命令及网址中的端口都改为 8001。

## 推荐发布方式：独立主页仓库

1. 登录 GitHub，新建一个 **Public** 仓库，例如 `reflex-project-page`。
2. 上传 `website` 文件夹**里面的文件和目录**到仓库根目录。也可以解压配套 ZIP 后上传其中内容。
   仓库打开后应直接看到 `index.html`、`styles.css`、`app.js`、`assets/`，而不是再套一层 `website/`。
   ZIP 文件本身不能代替网页文件；需要先解压。
3. 打开仓库 **Settings → Pages**。
4. **Source** 选择 **Deploy from a branch**。
5. **Branch** 选择 `main`，目录选择 **/(root)**，点击 **Save**。
6. 在 **Actions** 查看 Pages 构建，成功后回到 Pages 复制网站地址。
   项目默认地址为 `https://你的用户名.github.io/reflex-project-page/`。

官方说明：[配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 使用 Git 命令上传（可选）

先在 GitHub 创建上面的空仓库，以下命令只在独立的 `website` 目录操作：

```bat
cd /d "D:\workFileRecord\paper\Reflex(Feedback-Enhanced ReKep for Robotic Manipulation)\vsshRe\website"
git init
git add .
git commit -m "Add ReFlex English project page"
git branch -M main
git remote add origin https://github.com/你的用户名/reflex-project-page.git
git push -u origin main
```

替换命令中的用户名；按照 Git 的提示登录，然后按上面的 Pages 设置发布。
这些命令用于尚未初始化 Git 的主页目录；如果已经设置过仓库，后续只需 `git add .`、`git commit` 和 `git push`。
当前主页仓库为 `https://github.com/foolscientist/reflex-project-page`，网站地址为
`https://foolscientist.github.io/reflex-project-page/`。本目录已关联该仓库；后续更新无需重新初始化或添加远端。

## 正式署名与链接

修改 `site-config.js`：

- `authors`：当前为 `Shaoyi Wang`。
- `affiliation`：当前为 `Harbin Institute of Technology`；留空时不显示。
- `codeUrl`：填写机器人代码仓库地址。留空时，GitHub Pages 自动指向主页所在仓库；本地预览不显示 Code 按钮。
- `paperUrl`、`paperLabel`：当前文件是中文论文，按钮已注明；英文论文完成后替换 PDF 和标签。
- `citation`：当前使用上述作者的准备中稿件引用；论文公开后再补充发表信息。

所有网页正文为英文。网页没有加入尚未实测的成功率，也没有把固定轨迹标成自动修复结果。
以后更新网页文件并提交到 `main`，GitHub Pages 会再次部署。

## 同仓库发布（备选）

如果要放在已有论文代码仓库：把本目录内的网页文件放到该仓库的 `docs/`，
然后选择 `main` 与 **/docs** 作为 Pages 发布来源。
不要直接选择 `/website`：分支发布来源支持仓库根目录或 `docs/`；其他位置需自行配置 Actions。
