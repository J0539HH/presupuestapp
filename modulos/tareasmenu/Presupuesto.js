var ingresos = [];
var egresos = [];

document.addEventListener("DOMContentLoaded", function () {
  verificarSesion();
  cargarDatos();

  $("#agregar").on("click", function () {
    insertarMovimiento();
  });

  limpiarCampos();
});

function limpiarCampos() {
  $("#descripcion").val("");
  $("#valor").val("");
}

function insertarMovimiento() {
  let descripcion = $("#descripcion").val();
  let valorUnformated = $("#valor").val();
  let valorUnformated1 = valorUnformated.replaceAll(".", "");
  var ValorFormated = parseInt(valorUnformated1, 10);
  let tipoUnformated = $("#tipo").val();

  let ingresoBool = true;
  if (tipoUnformated === "egreso") {
    ingresoBool = false;
  }

  spinner("Registrando movimiento, por favor espere");

  const url = "/api/NewMovimiento";
  const data = {
    descripcion: descripcion,
    valor: ValorFormated,
    ingreso: ingresoBool,
  };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      AlertCorrectX("Movimiento registrado en el sistema ");
      $("#spinner").hide();
      cargarDatos();
    })
    .catch((error) => {
      console.error("Error al ingresar:", error);
      $("#spinner").hide();
    });

  limpiarCampos();
}

function NumerosFormateados(string) {
  var out = "";
  var filtro = "1234567890";
  for (var i = 0; i < string.length; i++)
    if (filtro.indexOf(string.charAt(i)) !== -1) out += string.charAt(i);
  out = parseInt(out, 10);
  out = out.toLocaleString("es-CO");
  if (out === "NaN") {
    out = "";
  }
  return out;
}

function cargarDatos() {
  $("#columnaIngresos").empty();
  $("#columnaEgresos").empty();

  spinner("Cargando usuarios, por favor espere");
  const url = "/api/movimientosTotal";
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      if (result === "NULL") {
        $("#spinner").hide();
        AlertCorrectX("Sin movimientos");
      } else {
        const tableData = { data: result };
        cargarTabla(tableData);
      }
    })
    .catch((error) => {
      // Lógica para manejar el error...
    });
}

function cargarTabla(datos) {
  ingresos = [];
  egresos = [];

  $.each(datos.data, function (index, movimiento) {
    if (movimiento.ingreso) {
      ingresos.push(movimiento.valor);
      var elemento =
        '<div class="elemento">' +
        '<div class="elemento_descripcion">' +
        movimiento.descripcion +
        "</div>" +
        '<div class="derecha">' +
        convertirFecha(movimiento.fecha) +
        '<div class="elemento_valor">' +
        (movimiento.ingreso ? "+ $ " : "- $ ") +
        movimiento.valor +
        "</div>" +
        '<div class="elemento_eliminar">' +
        '<img class="elemento_eliminar--btn" src="./media/delete.svg" onclick="cargarAlerta(' +
        movimiento.idmovimiento +
        ')">' +
        "</div>" +
        "</div>" +
        "</div>";
      $("#columnaIngresos").append(elemento);
    } else {
      egresos.push(movimiento.valor);
      var elemento =
        '<div class="elemento">' +
        '<div class="elemento_descripcion">' +
        movimiento.descripcion +
        "</div>" +
        '<div class="derecha">' +
        convertirFecha(movimiento.fecha) +
        '<div class="elemento_valor">' +
        (movimiento.ingreso ? "+ $ " : "- $ ") +
        movimiento.valor +
        "</div>" +
        '<div class="elemento_eliminar">' +
        '<img class="elemento_eliminar--btn" src="./media/delete1.svg" onclick="cargarAlerta(' +
        movimiento.idmovimiento +
        ')">' +
        "</div>" +
        "</div>" +
        "</div>";
      $("#columnaEgresos").append(elemento);
    }

    let totalIngreso = ingresos.reduce(function (acc, valor) {
      return acc + valor;
    }, 0);

    let totalEgreso = egresos.reduce(function (acc, valor) {
      return acc + valor;
    }, 0);

    var diferencia = totalIngreso - totalEgreso;
    $("#egresosTotales").html("-" + formatoMoneda(totalEgreso));
    $("#ingresosTotales").html("+" + formatoMoneda(totalIngreso));
    $("#presupuesto").html("+" + formatoMoneda(diferencia));
    $("#spinner").hide();
  });
}

function convertirFecha(fechaCompleta) {
  var fecha = new Date(fechaCompleta);
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1; // Los meses en JavaScript son base 0 (enero = 0)
  var anio = fecha.getFullYear().toString().slice(-2); // Obtener los últimos dos dígitos del año

  return dia + "/" + mes + "/" + anio;
}

function eliminarMovimiento(id) {
  spinner("Eliminado el movimiento, por favor espere");
  const url = "/api/deleteMov";
  const data = {
    idmovimiento: id,
  };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      AlertCorrectX("El movimiento se elimino con exito!");
      $("#spinner").hide();
      cargarDatos();
    })
    .catch((error) => {
      AlertIncorrecta("No se pudo cargar el movimiento");
      $("#spinner").hide();
    });
}

function cargarAlerta(id) {
  Swal.fire({
    title: "",
    text: "Esta seguro de eliminar el movimiento?",
    imageUrl: "../../Multimedia/icoAlertSuccess.svg",
    imageWidth: 80,
    imageHeight: 80,
    imageAlt: "Custom Icon",
    showConfirmButton: true,
    focusConfirm: false,
    allowOutsideClick: false,
    focusDeny: true,
    showDenyButton: true,
    confirmButtonText: "Aceptar",
    denyButtonText: "Cancelar",
    customClass: {
      container: "",
      popup: "",
      header: "",
      title: "",
      closeButton: "",
      icon: "",
      image: "",
      content: "",
      htmlContainer: "",
      input: "",
      inputLabel: "",
      validationMessage: "",
      actions: "",
      confirmButton: "buttonBtn btnPrimary",
      denyButton: "buttonBtn btnPrimary ",
      cancelButton: "",
      loader: "",
      footer: "",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarMovimiento(id);
    } else if (result.isDenied) {
      // DENIED CODE
    }
  });
}

const formatoMoneda = (valor) => {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};