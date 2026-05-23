# Ingeniería y Calidad de Software

2026

TP Integrador - Actividad 1: PRD

**Límite de entrega: Domingo 03/05 23:59 hs**

***[IMPORTANTE:]*** *Las dudas sobre este TP se realizan en <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/q-a>.*

***No se contestan dudas por email.***

***Previo al trabajo:***

- Tener una cuenta en github.com (con foto de perfil).
- Tener instalado git y configurar nombre y email (con el cual se registraron en github) con los siguientes comandos:

git config --global user.name "Mi Nombre"
git config --global user.email "nombre@gmail.com"


- Tener instalado nodejs: <https://nodejs.org/>
- Tener instalado docker: <https://www.docker.com/>
- Tener instalado Visual Studio Code (<https://code.visualstudio.com/>) y la extensión <https://marketplace.visualstudio.com/items?itemName=ms-python.python>

***Tareas correspondientes a esta actividad:***

1.  Un integrante del grupo deberá realizar un fork del repositorio de la aplicación "Alentapp", desarrollada para la cursada. Dicho repositorio se encuentra en <https://github.com/frlp-utn-ingsoft/alentapp>

2.  Luego de hacer el fork, se creará un nuevo repositorio, por ejemplo: *https://github.com/mi-usuario/alentapp.* Dicho integrante deberá añadir a los integrantes restantes del grupo como colaboradores **en el nuevo repositorio** creado por el fork.

3.  Cada integrante del grupo deberá **clonar el nuevo repositorio** en su computadora y seguir la guía de instalación que se encuentra en README.md.

4.  Cada integrante debe redactar el **Documento de Diseño Técnico (TDD)** para el ABM de su entidad asignada.

5.  Las tareas se solucionan utilizando el **workflow feature branch**. Cada TDD tiene que ser revisado y aprobado.

***Entidades:***

| **Entidad**            | **Regla de Negocio** |
|------------------------|----------------------|
| **Payment**            | Inmutabilidad: No se permite el borrado físico de los registros. Un pago sólo puede pasar a **status** "Canceled". |
| **MedicalCertificate** | Solo puede haber un certificado activo por socio. Al crear uno nuevo, el sistema debe **invalidar** los registros anteriores de ese socio. |
| **Locker**             | Un casillero no puede asignarse si su **status** es "Maintenance". Además, el **number** de casillero debe ser único. |
| **Sport**              | El **max_capacity** debe ser mayor a cero. El atributo **name** es inmutable después de la creación (solo se permite editar descripción y cupo). |
| **Discipline**         | Validación de fechas: La fecha de fin (**end_date**) debe ser estrictamente posterior a la de inicio (**start_date**). |
| **EquipmentLoan**      | Restricción por categoría: Los préstamos solo están permitidos para socios "Senior" o "Lifetime". Los "Cadet" tienen prohibido solicitar material. |

![Digrama](../DER.png)

***Entrega:***

La entrega se realiza a través del GitHub Discussions perteneciente a la organización de la cátedra, con la categoría Show and Tell: <https://github.com/orgs/frlp-utn-ingsoft/discussions/categories/show-and-tell>

Ahí van a tener que crear una discusión con el título *Actividad 1 - GRUPO X* y dejando el link al repositorio en la descripción.

Ejemplo:

![Ejemplo](docs/ejemplo1.png)

***[IMPORTANTE:]*** *No se puede resolver el trabajo haciendo commits desde la interfaz de Github.*

***Ayuda y Documentación:***

- Comandos principales de git (sólo secciones EFECTUAR CAMBIOS, CREAR REPOSITORIOS y SINCRONIZAR CAMBIOS): <https://training.github.com/downloads/es_ES/github-git-cheat-sheet.pdf>
- git: <https://git-scm.com/>
- Forking: <https://guides.github.com/activities/forking/>
- Colaboradores: <https://help.github.com/en/articles/inviting-collaborators-to-a-personal-repository>
- Guía de instalación: <https://git-scm.com/book/es/v1/Fundamentos-de-Git-Obteniendo-un-repositorio-Git#Clonando-un-repositorio-existente>
- Herramienta para practicar branching: <https://learngitbranching.js.org/?locale=es_ES>
- Documentación sobre markdown para escribir un README.md:
  - <https://dillinger.io/>
  - <https://guides.github.com/features/mastering-markdown/>