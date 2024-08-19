![LOGO](https://i.imgur.com/usLUB7r.png "")


![](https://img.shields.io/visual-studio-marketplace/v/ACSPL.acsplext?color=FF3333&label=Version&logo=ver&logoColor=%23FF3333  "")

# What is ACSPL+ Programming Language?
ACS motion controllers run on ACSPL+, a real-time motion programming language whose unique level of flexibility enables machine developers to quickly realize rich functionality.

# For who this extenstion for?
People who work with **ACSPL+** but want to have a highlight language.
This Visual Studio Code extension is designed specifically for developers and engineers who work with ACSPL+—the programming language used in ACS Motion Control systems. While ACSPL+ is a powerful tool for controlling motion systems, writing code directly within the MMI program can sometimes be cumbersome and prone to challenges.

One of the common issues developers face when coding directly in MMI is the risk of disconnection from the controllers. This can happen due to network instability, hardware issues, or other unforeseen circumstances, leading to lost progress or interruptions in your workflow. Additionally, it can be easy to forget to save your work to the controller or simulator, especially when you're focused on debugging or making quick adjustments. These situations not only slow down the development process but can also lead to errors and inefficiencies.

This extension aims to enhance your coding experience by providing syntax highlighting for ACSPL+ within Visual Studio Code, making your code more readable and easier to manage. By allowing you to work in a stable, feature-rich environment like VS Code, this extension helps mitigate the risks of losing your work due to disconnections or unsaved changes, ensuring that your coding sessions are smoother and more productive.

# Why Use This Extension?
Focused Tool for ACSPL+: If you frequently write ACSPL+ code and want a better environment than MMI alone can provide, this extension is for you. It’s a simple, focused tool that enhances your productivity by making your code more readable and easier to write.
Ideal for Motion Control Engineers: Whether you're developing new motion control routines or maintaining existing ACSPL+ programs, this extension provides the clarity and efficiency you need.


> **Note**
> If you're having trouble with the packages please submit me an email barp@acsmotioncontrol.com


# Key Features and Advantages
* Markup Language that has all key factors.
* Function refernce.
* User can define any function and any variable he want.
* Rich multi-axis motion command set
* High-level program flow commands: IF-ELSE, WHILE, LOOP, GOTO
* Object-oriented structures: STRUCT
* User defined functions, subroutines, autoroutines
* 💥🆕 USING G-CODE 🆕💥


# An exmaple code to work with
> **Note**
> This extension is purely for code editing and does not interact directly with ACS Motion Control systems or provide debugging capabilities. Its primary purpose is to serve as a code editor for ACSPL+ with enhanced readability.
### Example Snippets:
```JAVA
 ENABLE(0)
 !functions decleration
 STRING(30) concat(String REF s1, String REF s2);
 String(50) concat_return(String REF s1,String REF s2);
 
 !Code1
 string st1(10)="hello"
 string st2(10)="world"
 string st3(10)
 st3=concat(s1,s2);
 
STOP
```


```JAVA
 int x = 0 
 ENABLE(x)
 
 VEL(x) = 3000
 SET FPOS(x)=0
 sctrigger 2
 
 PTP/x x,1000
 wait 500
 PTP/r x,500
 PTP/vr x,500,5000
 STOP
```
# Interaction between VSCODE(ACSPL+ Extention) and MMI

![Example of code from vscode to MMI](images/logoacs.png  "ACSPL Highlighter")

![Example of code from vscode to MMI](images/logoacs.png  "ACSPL Highlighter")



@Bar Popko
