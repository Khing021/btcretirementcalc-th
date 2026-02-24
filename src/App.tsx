import { useTranslation } from "react-i18next";
import "./App.scss";
import Calculator from "./components/Calculator";
import { GithubOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { ConfigProvider, Switch, theme } from "antd";
import { useLayoutEffect, useState } from "react";
import useLocalStorage from "use-local-storage";

function App() {
  const [t] = useTranslation();
  const defaultDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [userTheme, setUserTheme] = useLocalStorage("theme", defaultDark ? "dark" : "light");
  const [useDarkMode, setUseDarkMode] = useState(defaultDark);

  const toggleDarkMode = (darkMode: boolean) => {
    setUseDarkMode(darkMode);
  };
  useLayoutEffect(() => {
    if (useDarkMode) {
      document.body.classList.add("dark");

      setUserTheme("dark");
    } else {
      document.body.classList.remove("dark");
      setUserTheme("light");
    }
  }, [setUserTheme, useDarkMode]);

  return (
    <div data-theme={userTheme}>
      <ConfigProvider
        theme={{
          algorithm: useDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <div className="app">
          <div>
            <div className="title">
              <div>
                <img src="./bitcoin-logo2.png" width="40px"></img>
              </div>
              <span>{t("app.title")}</span>
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={useDarkMode}
                onChange={(useDarkMode) => toggleDarkMode(useDarkMode)}
              ></Switch>
            </div>
          </div>
          <Calculator />
          <div className="signature">
            <div className="signature-line disclaimer-line">
              <span>{t("footer.disclaimer")}</span>
            </div>
            <div className="signature-line">
              <span>{t("footer.originally-created-by")}</span>
              <a target="blank" href="https://github.com/pampeanodev">
                @pampeanodev
              </a>
              <a target="blank" href="https://calc.bitcoineracademy.com/">
                (Bitcoiner Academy)
              </a>
            </div>
            <div className="signature-line support-line">
              <span>{t("footer.support-original")}</span>
            </div>
            <div className="signature-line">
              <span>{t("footer.adapted-by")} ขิงว่านะ</span>
              <a target="_blank" href="https://github.com/Khing021/btcretirementcalc-th">
                <GithubOutlined className="github-logo" />
              </a>
            </div>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}

export default App;
