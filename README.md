![LOGO](https://i.imgur.com/OYpdtil.png)

![](https://img.shields.io/visual-studio-marketplace/v/ACSPL.acsplext?color=FF3333&label=Version&logo=ver&logoColor=%23FF3333 "")
![TypeScript](https://img.shields.io/badge/code-TypeScript-3178C6.svg?logo=typescript&style=flat)
![Visual Studio Code](https://img.shields.io/badge/editor-VSCode-007ACC.svg?logo=visual-studio-code)
![Extension](https://img.shields.io/badge/extension-VSCode-007ACC.svg?logo=visual-studio-code)
![Python](https://img.shields.io/badge/code-Python-3776AB.svg?logo=python&style=flat)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Bar%20Popko-0A66C2?logo=linkedin)](https://www.linkedin.com/in/barpupko/)

# What is ACSPL+ Programming Language?
ACS motion controllers run on **ACSPL+**, a real-time motion programming language whose unique level of flexibility enables machine developers to quickly realize rich functionality.

# Who is This Extension For?
This Visual Studio Code extension is designed specifically for developers and engineers who work with **ACSPL+**—the programming language used in **ACS Motion Control** systems. While ACSPL+ is a powerful tool for controlling motion systems, writing code directly within the MMI program can sometimes be cumbersome and prone to challenges.

One of the common issues developers face when coding directly in **MMI** is the risk of **disconnection** from the controllers. This can happen due to network instability, hardware issues, or other unforeseen circumstances, leading to lost progress or interruptions in your workflow. Additionally, it can be easy to forget to save your work to the controller or simulator, especially when you're focused on debugging or making quick adjustments. These situations not only slow down the development process but can also lead to errors and inefficiencies.

This extension aims to **enhance your coding experience** by providing **syntax highlighting** for ACSPL+ within **Visual Studio Code**, making your code more readable and easier to manage. By allowing you to work in a stable, feature-rich environment like **VS Code**, this extension helps avoid the risks of losing your work due to disconnections or unsaved changes, ensuring that your coding sessions are smoother and more productive.

# Why Use This Extension?
- **Focused Tool for ACSPL+**: If you frequently write **ACSPL+** code and want a another codding environment beside the **MMI**, this extension is for you. It enhances your productivity by making your code more readable and easier to write.
- **Ideal for Motion Control Engineers**: Whether you're developing new motion control routines or maintaining existing **ACSPL+** programs, this extension provides the clarity and efficiency you need.

> **Note**  
> If you're having trouble with the packages, please email me at **barp@acsmotioncontrol.com**

# Key Features and Advantages
- **Syntax highlighting for ACSPL+**
- **Function reference**
- **User-defined functions and variables**
- **Rich multi-axis motion command set**
- **High-level program flow commands**: `IF-ELSE`, `WHILE`, `LOOP`, `GOTO`
- **Object-oriented structures**: `STRUCT`
- **User-defined functions, subroutines, and autoroutines**
-  **Supports G-Code**
- 💥**New Color Theme** 💥
- 💥**A Monty AI Assistance for ACSPL+ And other matters.** 💥



# Example Code for ACSPL+
> **Note**  
> This extension is purely for code editing and does not interact directly with ACS Motion Control systems or provide debugging capabilities. Its primary purpose is to serve as a **code editor for ACSPL+** with enhanced readability.

### Real Controller & Simulator Example Snippets:
```java
! Function Declarations
void concat(String REF s1, String REF s2, String REF s3);
String(50) concat_return(String REF s1, String REF s2);

! Code Usage Example
String st1(20) = "WELCOME TO ";
String st2(10) = "ACSPL+";
String st3(50);

concat(st1, st2, st3);
disp(st3);

STOP;

! Function Implementations
void concat(String REF s1, String REF s2, String REF s3)
{
    s3 = s1 + s2;
    ret
}

String(50) concat_return(String REF s1, String REF s2)
{
    ret s1 + s2;
}

```
### Real Controller Example Snippets:


```JAVA
!--THE NEXT CODE VALUES IS DEPENDS ON YOUR STAGE !
int x = 0;
ENABLE(x);
COMMUT(x);
VEL(x) = 3000;
SET FPOS(x) = 0;
sctrigger 2;
 
PTP/r x, 25;
wait 500;
PTP/r x, 25;
PTP/vr x, 0, 25;
STOP;
```
### Simulator Example Snippets:

```JAVA
!--THE NEXT CODE VALUES IS DEPENDS ON YOUR STAGE !
int x = 0;
ENABLE(x);
VEL(x) = 3000;
SET FPOS(x) = 0;
sctrigger 2;
 
PTP/r x, 25;
wait 500;
PTP/r x, 25;
PTP/vr x, 0, 25;
STOP;
```
# Interaction between VSCODE(ACSPL+ Extention) and MMI

![Example of code from vscode to MMI](https://i.imgur.com/KsdypyH.gif "ACSPL Highlighter")




@Bar Popko
