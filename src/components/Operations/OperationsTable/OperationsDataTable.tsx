"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";

import NewOperationForm from "@/components/Forms/NewOperationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React from "react";

import { OperationProps } from "@/components/Customers/CostumersView";
import EditOperationForm from "@/components/Forms/EditOperationForm";
import NewOperationTypeForm from "@/components/Forms/NewOperationTypeForm";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CollaboratorContext } from "@/contexts/CollaboratorContext";
import { SubscriberContext } from "@/contexts/SubscriberContext";
import { UserDataProps } from "@/types/UserDataProps";
import * as XLSX from "xlsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  userData: UserDataProps;
  collaborators: UserDataProps[];
}

export function OperationsDataTable<TData, TValue>({
  columns,
  data,
  userData,
  collaborators,
}: DataTableProps<TData, TValue>) {
  const { collaborator } = React.useContext(CollaboratorContext);
  const { subscriber } = React.useContext(SubscriberContext);

  const permission =
    !collaborator && subscriber?.plano !== "Individual"
      ? true
      : collaborator &&
        collaborator.permissions.gerenciarOperacoesDeOutros === true
      ? true
      : false;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      valorRecebido: false,
      criadoPor: permission,
    });

  const [searchParams, setSearchParams] = useSearchParams();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange",
  });

  function handleExport() {
    const data2 = data as OperationProps[];
    const operationData = data2.map((item) => {
      return {
        cliente: item.cliente,
        tipoDeOperacao: item.tipoDaOperacao,
        dataDaOperacao: item.dataDaOperacao
          .toDate()
          .toLocaleDateString("pt-BR"),
        statusDaOperacao: item.statusDaOperacao,
        valorLiberado: item.valorLiberado,
        comissao: item.comissao,
        valorRecebido: item.valorRecebido,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(operationData);

    XLSX.utils.book_append_sheet(wb, ws, "Tabela de Operações");

    XLSX.writeFile(wb, "Tabela de Operações.xlsx");
  }

  const manageOperationTypePermission = !collaborator
    ? true
    : collaborator && collaborator.permissions.gerenciarTipoDeOperacoes === true
    ? true
    : false;

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex gap-2 min-[1400px]:hidden"
              variant="outline"
            >
              Filtros <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="p-4 grid grid-cols-2 gap-2"
            align="start"
          >
            <Input
              placeholder="Nome do cliente"
              value={
                (table.getColumn("cliente")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("cliente")?.setFilterValue(event.target.value)
              }
              className="max-w-sm w-[300px] col-span-2"
            />
            {permission && (
              <Select
                value={
                  (table.getColumn("criadoPor")?.getFilterValue() as string) ??
                  ""
                }
                onValueChange={(event) => {
                  table.getColumn("criadoPor")?.setFilterValue(event);
                }}
              >
                <SelectTrigger
                  className={`w-[300px] col-span-2 ${
                    !table.getColumn("criadoPor")?.getFilterValue() &&
                    "text-slate-500"
                  } font-normal`}
                >
                  <SelectValue placeholder="Criado por"></SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[300px]">
                  <SelectGroup>
                    {collaborators && collaborators.length > 0 ? (
                      collaborators.map((collaborator) => (
                        <SelectItem
                          value={collaborator.id}
                          key={collaborator.id}
                        >
                          <div className="flex gap-3 items-center">
                            <Avatar className="size-6">
                              <AvatarImage src={collaborator.avatar} />
                              <AvatarFallback className="bg-slate-50">
                                {collaborator.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {collaborator.nome}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-sm text-center my-2">
                        Nenhum colaborador encontrado
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <Select
              value={
                (table
                  .getColumn("statusDaOperacao")
                  ?.getFilterValue() as string) ?? ""
              }
              onValueChange={(event) =>
                table.getColumn("statusDaOperacao")?.setFilterValue(event)
              }
            >
              <SelectTrigger
                className={`${
                  !table.getColumn("statusDaOperacao")?.getFilterValue() &&
                  "text-slate-500"
                } font-normal`}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="falha">Falha</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={
                (table
                  .getColumn("tipoDaOperacao")
                  ?.getFilterValue() as string) ?? ""
              }
              onValueChange={(event) =>
                table.getColumn("tipoDaOperacao")?.setFilterValue(event)
              }
            >
              <SelectTrigger
                className={`${
                  !table.getColumn("tipoDaOperacao")?.getFilterValue() &&
                  "text-slate-500"
                } font-normal`}
              >
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="w-[200px]">
                {manageOperationTypePermission && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full flex gap-2 justify-between"
                        >
                          Adicionar/remover
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <NewOperationTypeForm />
                    </Dialog>

                    <Separator className="mb-2" />
                  </>
                )}

                <SelectGroup>
                  {userData &&
                  userData.tiposDeOperacoes &&
                  userData.tiposDeOperacoes.length > 0 ? (
                    userData.tiposDeOperacoes.map((tipo) => (
                      <SelectItem
                        value={tipo.name}
                        key={`${tipo.color}-${tipo.name}`}
                      >
                        {tipo.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-sm text-center my-2">
                      Nenhum tipo encontrado
                    </div>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:text-red-800 hover:bg-red-50 col-span-2"
              onClick={() => {
                table.getColumn("statusDaOperacao")?.setFilterValue("");
                table.getColumn("tipoDaOperacao")?.setFilterValue("");
                table.getColumn("cliente")?.setFilterValue("");
                table.getColumn("criadoPor")?.setFilterValue("");
              }}
            >
              <X className="h-4 w-4 mr-2 " />
              Limpar filtros
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="gap-2 items-center hidden min-[1400px]:flex">
          <Select
            value={
              (table
                .getColumn("statusDaOperacao")
                ?.getFilterValue() as string) ?? ""
            }
            onValueChange={(event) =>
              table.getColumn("statusDaOperacao")?.setFilterValue(event)
            }
          >
            <SelectTrigger
              className={`w-[160px] ${
                !table.getColumn("tipoDaOperacao")?.getFilterValue() &&
                "text-slate-500"
              } font-normal`}
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="falha">Falha</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder="Nome do cliente"
            value={
              (table.getColumn("cliente")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("cliente")?.setFilterValue(event.target.value)
            }
            className="max-w-sm w-[300px]"
          />

          <Select
            value={
              (table.getColumn("tipoDaOperacao")?.getFilterValue() as string) ??
              ""
            }
            onValueChange={(event) =>
              table.getColumn("tipoDaOperacao")?.setFilterValue(event)
            }
          >
            <SelectTrigger
              className={`w-[160px] ${
                !table.getColumn("tipoDaOperacao")?.getFilterValue() &&
                "text-slate-500"
              } font-normal`}
            >
              <SelectValue placeholder="Tipo"></SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[200px]">
              {manageOperationTypePermission && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex gap-2 justify-between"
                      >
                        Adicionar/remover
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <NewOperationTypeForm />
                  </Dialog>

                  <Separator className="mb-2" />
                </>
              )}

              <SelectGroup>
                {userData &&
                userData.tiposDeOperacoes &&
                userData.tiposDeOperacoes.length > 0 ? (
                  userData.tiposDeOperacoes.map((tipo) => (
                    <SelectItem
                      value={tipo.name}
                      key={`${tipo.color}-${tipo.name}`}
                    >
                      {tipo.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-sm text-center my-2">
                    Nenhum tipo encontrado
                  </div>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          {permission && (
            <Select
              value={
                (table.getColumn("criadoPor")?.getFilterValue() as string) ?? ""
              }
              onValueChange={(event) => {
                table.getColumn("criadoPor")?.setFilterValue(event);
              }}
            >
              <SelectTrigger
                className={`w-[240px] ${
                  !table.getColumn("criadoPor")?.getFilterValue() &&
                  "text-slate-500"
                } font-normal`}
              >
                <SelectValue placeholder="Criado por"></SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[300px]">
                <SelectGroup>
                  {collaborators && collaborators.length > 0 ? (
                    collaborators.map((collaborator) => (
                      <SelectItem value={collaborator.id} key={collaborator.id}>
                        <div className="flex gap-3 items-center">
                          <Avatar className="size-6">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback className="bg-slate-50">
                              {collaborator.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {collaborator.nome}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-sm text-center my-2">
                      Nenhum colaborador encontrado
                    </div>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => {
              table.getColumn("statusDaOperacao")?.setFilterValue("");
              table.getColumn("tipoDaOperacao")?.setFilterValue("");
              table.getColumn("cliente")?.setFilterValue("");
              table.getColumn("criadoPor")?.setFilterValue("");
            }}
          >
            <X className="h-4 w-4 mr-2 " />
            Limpar filtros
          </Button>
        </div>

        <Dialog
          open={
            searchParams.get("novaOperacao") ||
            searchParams.get("editarOperacao")
              ? true
              : false
          }
        >
          <DialogTrigger asChild>
            <Button onClick={() => setSearchParams({ novaOperacao: "true" })}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova operação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px]">
            {!searchParams.get("editarOperacao") ? (
              <NewOperationForm />
            ) : (
              <EditOperationForm />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-1" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-10 text-center"
                >
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => handleExport()}>
              <Download className="size-4 mr-2" />
              Exportar dados
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm  ml-2 p-0 text-slate-700">
              Página{" "}
              <span className="font-bold">
                {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
