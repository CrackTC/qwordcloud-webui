$(document).ready(() => {
    $("#status").text("Loading...");
    $("#status").css("color", "black");

    const url = localStorage.getItem("url");
    const token = localStorage.getItem("token");
    if (url == null || token == null) {
        window.location.replace("login.html");
    }

    $.ajax({
        url: new URL("api/get_handlers", url),
        type: "GET",
        success: result => {
            result.data.forEach(({name, enabled}) => {
                $("#handlers").append(`<li><input type="radio" name="handler" value="${name}"> ${name} <input type="checkbox" ${enabled ? "checked" : ""} data-name="${name}"></li>`);
            });
        }
    }).then(() => {
        $("#handlers").on("change", "input[type=checkbox]", function () {
            const name = $(this).data("name");
            const enabled = $(this).prop("checked");

            $.ajax({
                url: new URL(enabled ? "api/enable_handler" : "api/disable_handler", url),
                type: "GET",
                data: {name, token},
                success: result => {
                    $("#status").text(JSON.stringify(result));
                    $("#status").css("color", "green");
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                    $(this).prop("checked", !enabled);
                }
            })
        });

        $("#handlers").on("change", "input[type=radio]", function () {
            const name = $(this).val();

            $.ajax({
                url: new URL("api/get_groups", url),
                type: "GET",
                data: {token},
                success: result => {
                    $("#groups").empty();
                    result.data.forEach(name => {
                        $("#groups").append(`<li><input type="checkbox" data-name="${name}"> ${name}</li>`);
                    });
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                }
            }).then(() => {
                $.ajax({
                    url: new URL("api/get_handler_groups", url),
                    type: "GET",
                    data: {name, token},
                    success: result => {
                        result.data.forEach(name => {
                            $(`input[data-name="${name}"]`).prop("checked", true);
                        });
                    },
                    error: (_, textStatus) => {
                        $("#status").text(textStatus);
                        $("#status").css("color", "red");
                    }
                });
            });
        });

        $("#groups").on("change", "input[type=checkbox]", function () {
            const name = $("input[type=radio]:checked").val();
            const group = $(this).data("name");
            const enabled = $(this).prop("checked");

            $.ajax({
                url: new URL(enabled ? "api/add_group" : "api/remove_group", url),
                type: "GET",
                data: {name, group, token},
                success: result => {
                    $("#status").text(JSON.stringify(result));
                    $("#status").css("color", "green");
                },
                error: (_, textStatus) => {
                    $("#status").text(textStatus);
                    $("#status").css("color", "red");
                    $(this).prop("checked", !enabled);
                }
            })
        });

        $("#status").text("Loaded");
        $("#status").css("color", "green");
    })

    $("#logout").click(() => {
        localStorage.removeItem("url");
        localStorage.removeItem("token");
        window.location.replace("login.html");
    });
});
