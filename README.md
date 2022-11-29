![LOGO](https://i.imgur.com/usLUB7r.png "")


# For who this extenstion for?
![](https://img.shields.io/visual-studio-marketplace/v/ACSPL.acsplext?color=FF3333&label=Version&logo=ver&logoColor=%23FF3333  "")
![visitors](https://visitor-badge.glitch.me/badge?page_id=VSC-ACSPL&left_color=blue&right_color=grey)


People who work with **ACSPL+** but want to have a highlight language.
this extenstion is dosent have any functionality,and only use to write and copy the function from the vs-code into the MMI program.
therefor this is a great tool to help you write a better code.


# What is ACSPL+ Programming Language?
ACS motion controllers run on ACSPL+, a real-time motion programming language whose unique level of flexibility enables machine developers to quickly realize rich functionality.



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
### THE CODE:
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


![Example of code from vscode to MMI](https://im.ezgif.com/tmp/ezgif-1-9594041c99.gif  "ACSPL Highlighter")


© BAR POPKO 2022 ©