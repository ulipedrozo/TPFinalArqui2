import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Instruction } from './Clases/Instruction';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { LoopUnrolling } from './Clases/LoopUnrolling';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Processor } from './Clases/Processor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  @ViewChild("siteConfigNetwork", { static: true }) networkContainer: ElementRef;

  listInstructions = new Array<Instruction>();
  listInstructionsUnrolling = new Array<Instruction>();
  listaSinLazo = new Array<Instruction>();

  numOrder = 1;
  numMultifunction = 0;
  numArithmetic = 0;
  numMemory = 0;
  configurationSaved: boolean = false;
  showAlert = false;

  // variables simulador
  sigInstruction = true;
  executing = false;
  executeLoop = false;
  DHeaders: Array<string>;
  UFHeaders: Array<string>;
  cpu: Processor;

  typeInstruction = [
    { type: "ADD", cycle: 1 },
    { type: "SUB", cycle: 1 },
    { type: "MUL", cycle: 1 },
    { type: "DIV", cycle: 1 },
    { type: "ST", cycle: 1 },
    { type: "LD", cycle: 1 },
    { type: "BNEZ", cycle: 1 },
    { type: "LAZO", cycle: 1 }
  ];

  registers: string[] = [
    "#4",
    "#8",
    "R0",
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6",
    "R7",
    "R8",
    "R9",
    "R10",
    "R11",
    "R12",
    "R13",
    "R14",
    "R15",
    "R16",
    "R17",
    "R18",
    "R19",
    "R20",
    "R21",
    "R22",
    "R23",
    "R24",
    "R25",
    "R26",
    "R27",
    "R28",
    "R29",
    "R30",
    "R31",
  ];

  btnDefaultIns = {
    type: "Instrucción",
    dst: "Dst",
    op1: "Op1",
    op2: "Op2"
  };

  mapTipoArreglos = new Map();

  btnDefaultCarga = {
    typeReg: "Tipo",
    cycles: "Cantidad ciclos",
    dstLoad: "Dst",
  };

  typeArray: string[] = [
    "ENTERO",
    "DOUBLE",
  ];

  cycles: string[] = [
    "100", "500", "1000", "2000", "3000", "4000"
  ];

  ngOnInit(): void {
    const instrucions = [
      new Instruction("", "LD", "R1", "4000", "", "ARITH", ""),
      new Instruction("", "LAZO", "", "", "", "", ""),
      new Instruction("", "LD", "R2", "0 (R1)", "", "MEM", "ENTERO"),
      new Instruction("", "ADD", "R4", "R2", "R3", "ARITH", ""),
      new Instruction("", "ST", "0 (R1)", "R4", "", "MEM", "ENTERO"),
      new Instruction("", "SUB", "R1", "R1", "#4", "ARITH", ""),
      new Instruction("", "BNEZ", "R1", "LAZO", "", "ARITH", "")
    ];
    this.listInstructions = instrucions;
  }

  changeInst(pos, name) {
    this.btnDefaultIns[pos] = name;
    this.updateButton();
  }

  changeCarga(pos, name) {
    this.btnDefaultCarga[pos] = name;
    this.updateButtonLoad();
  }

  updateButtonLoad() {
    let btnAgregarLd = document.getElementById("btn-Agregar-LD");

    if (this.btnDefaultCarga.typeReg != "Tipo" && this.btnDefaultCarga.dstLoad != "Dst" && this.btnDefaultCarga.cycles != "Cantidad ciclos")
      btnAgregarLd.removeAttribute("disabled");
  }

  addInstructionLoad() {
    let instNueva;

    let tipo: string = this.btnDefaultCarga.typeReg;
    let ciclos: number = parseInt(this.btnDefaultCarga.cycles);
    let tamano: number;
    if (tipo == "ENTERO")
      tamano = ciclos * 4;
    else
      tamano = ciclos * 8;

    let tamTot;
    if (this.listInstructions.length > 0) {
      tamTot = tamano + parseInt(this.listInstructions[this.listInstructions.length - 1].getOp1()); // Ver esto
    } else
      tamTot = tamano;

    this.mapTipoArreglos.set(this.btnDefaultCarga.dstLoad, tipo);
    instNueva = new Instruction("", "LD", this.btnDefaultCarga.dstLoad, tamTot.toString(), "", "ARITH", "");
    instNueva.setciclosFor(tamano);
    instNueva.setArrayType(tipo);
    this.listInstructions.push(instNueva);
  }

  aux: string = "Op1";

  updateButton() {
    let btnAgr = document.getElementById("btn-Agregar");
    let btnDst = document.getElementById("btn-dst");
    let btnOp1 = document.getElementById("btn-op1");
    let btnOp2 = document.getElementById("btn-op2");

    switch (this.btnDefaultIns.type) {

      case "ST": {
        if (this.btnDefaultIns.op1 == "LAZO")
          this.btnDefaultIns.op1 = this.aux;
        btnDst.removeAttribute("disabled");
        btnOp1.removeAttribute("disabled");
        btnOp2.setAttribute("disabled", "");
        btnAgr.setAttribute("disabled", "");
        if (this.btnDefaultIns.dst != "Dst" && this.btnDefaultIns.op1 != "Op1")
          btnAgr.removeAttribute("disabled");
        break;
      }
      case "LD": {
        if (this.btnDefaultIns.op1 == "LAZO")
          this.btnDefaultIns.op1 = this.aux;
        btnDst.removeAttribute("disabled");
        btnOp1.removeAttribute("disabled");
        btnOp2.setAttribute("disabled", "");
        btnAgr.setAttribute("disabled", "");
        if (this.btnDefaultIns.dst != "Dst" && this.btnDefaultIns.op1 != "Op1")
          btnAgr.removeAttribute("disabled");
        break;
      }
      case "BNEZ": {
        if (this.btnDefaultIns.op1 == "LAZO")
          this.btnDefaultIns.op1 = this.aux;
        btnDst.removeAttribute("disabled");
        btnOp1.setAttribute("disabled", "");
        this.aux = this.btnDefaultIns.op1;
        this.btnDefaultIns.op1 = "LAZO";
        btnOp2.setAttribute("disabled", "");
        if (this.btnDefaultIns.dst != "Dst")
          btnAgr.removeAttribute("disabled");
        break;
      }
      case "LAZO": {
        if (this.btnDefaultIns.op1 == "LAZO")
          this.btnDefaultIns.op1 = this.aux;
        btnDst.setAttribute("disabled", "");
        btnOp1.setAttribute("disabled", "");
        btnOp2.setAttribute("disabled", "");
        btnAgr.removeAttribute("disabled");
        break;
      }
      default: {
        if (this.btnDefaultIns.op1 == "LAZO")
          this.btnDefaultIns.op1 = this.aux;
        btnDst.removeAttribute("disabled");
        btnOp1.removeAttribute("disabled");
        btnOp2.removeAttribute("disabled");
        btnAgr.setAttribute("disabled", "");
        if (this.btnDefaultIns.type != "Instrucción" && this.btnDefaultIns.dst != "Dst" && this.btnDefaultIns.op1 != "Op1" && this.btnDefaultIns.op2 != "Op2")
          btnAgr.removeAttribute("disabled");
        break;
      }
    }

  }

  addInstruction() {
    let instNueva;

    if (this.btnDefaultIns.type == "ST") {
      instNueva = new Instruction("", this.btnDefaultIns.type, "0 (" + this.btnDefaultIns.dst + ")", this.btnDefaultIns.op1, "", "MEM", this.mapTipoArreglos.get(this.btnDefaultIns.dst));
    }
    else
      if (this.btnDefaultIns.type == "LD") {
        instNueva = new Instruction("", this.btnDefaultIns.type, this.btnDefaultIns.dst, "0 (" + this.btnDefaultIns.op1 + ")", "", "MEM", this.mapTipoArreglos.get(this.btnDefaultIns.op1));
      }
      else
        if (this.btnDefaultIns.type == "BNEZ")
          instNueva = new Instruction("", this.btnDefaultIns.type, this.btnDefaultIns.dst, "LAZO", "", "ARITH", "");
        else
          if (this.btnDefaultIns.type == "LAZO")
            instNueva = new Instruction("", this.btnDefaultIns.type, "", "", "", "", "");
          else
            instNueva = new Instruction("", this.btnDefaultIns.type, this.btnDefaultIns.dst, this.btnDefaultIns.op1, this.btnDefaultIns.op2, "ARITH", "");
    this.listInstructions.push(instNueva);
  }

  changeOrder(num) {
    this.numOrder = num;
  }

  deleteInstruction(inst: Instruction) {
    let i = this.listInstructions.indexOf(inst);
    if (this.listInstructions[i].getType() == "LD" && !this.listInstructions[i].getOp1().includes('(')) {
      this.recalculateCycles(i, this.listInstructions[i].getciclosFor());
      this.mapTipoArreglos.delete(this.listInstructions[i].getDestination());
    }
    this.listInstructions.splice(i, 1);

  }

  recalculateCycles(i: number, op1: number) {

    for (var j = 0; j < this.listInstructions.length; j++)
      if (this.listInstructions[j].getType() == "LD" && !this.listInstructions[j].getOp1().includes('(')) {
        if (i < j) {
          let actual: number = parseInt(this.listInstructions[j].getOp1());
          this.listInstructions[j].setOp1((actual - op1).toString());
        }
      }

  }

  changeUFmultifunction(num) {
    this.numMultifunction = num;
  }

  changeUFArithmetic(num) {
    this.numArithmetic = num;
  }

  changeUFMemory(num) {
    this.numMemory = num;
  }

  changeCycle(pos, numcycle) {
    for (let tipoIns of this.typeInstruction) {
      if (tipoIns.type == pos)
        tipoIns.cycle = numcycle;
    }
  }

  saveConfiguration() {
    if (this.numArithmetic != 0 || this.numMemory != 0 || this.numMultifunction != 0) {
      this.configurationSaved = true;
      this.executeLoop = false;
      this.executing = true;
      this.showAlert = false;
    }
    else {
      this.showAlert = true;
    }
  }

  private setCycles() {
    for (let i = 0; i < this.listInstructionsUnrolling.length; i++) {
      for (let j = 0; j < this.typeInstruction.length; j++)
        if (this.listInstructionsUnrolling[i].getType() == this.typeInstruction[j].type) {
          this.listInstructionsUnrolling[i].setCycles(this.typeInstruction[j].cycle);
        }
    }
  }

  resetConfiguration() {
    this.configurationSaved = false;
    this.sigInstruction = false;
    this.executing = false;
    this.executeLoop = false;
    this.listInstructionsUnrolling = null;
    this.listaSinLazo = new Array<Instruction>();
  }

  ejecutarLoopUnrolling() {

    let maxUnroll = Math.max(this.numArithmetic, this.numMemory, this.numMultifunction);

    let loop = new LoopUnrolling(this.listInstructions);
    this.listInstructionsUnrolling = loop.ejecutar(maxUnroll);
    this.setCycles();
    this.simuladorLoopUnrolling();

  }

  simuladorLoopUnrolling() {

    this.sigInstruction = true;
    this.executing = false;
    this.executeLoop = true;
    this.createTableHead("D", this.numOrder);
    this.createTableHeadUF("UF", this.numMultifunction, this.numMemory, this.numArithmetic);

    for (let index = 0; index < this.listInstructionsUnrolling.length; index++){
      if (this.listInstructionsUnrolling[index].getId() != ""){
        this.listaSinLazo.push(this.listInstructionsUnrolling[index]);
      }
    } 
    console.log(this.listaSinLazo);
    this.cpu = new Processor(this.listaSinLazo, this.numOrder);
    this.cpu.addUF(this.numArithmetic, this.numMemory, this.numMultifunction);
  }

  public nextInstruction() {
    if (!this.cpu.isFinished()) {
      this.cpu.nextCycle();
      this.addRowCounter(this.cpu.getCycleCounter());
      this.addRow(this.cpu.getDispatcher().instruction, "tablaDispatch", this.numOrder);
      this.addRowUF(this.cpu.getUF());
    }
    else {
      this.sigInstruction = false;
      //this.showFinished = true;
      //this.timePar = this.cpu.getCycleCounter();
      //this.timeTotal = this.timeSec / this.timePar;
    }
  }

  addRowCounter(cycleCounter: number) {
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    td.appendChild(document.createTextNode("" + cycleCounter));
    tr.appendChild(td);
    document.getElementById("tablacycle").appendChild(tr);

  }

  addRow(inst: Array<Instruction>, id: string, cantidad: Number) {
    let tr = document.createElement("tr");
    for (let i = 0; i < cantidad; i++) {
      let td = document.createElement("td");
      if (i < inst.length) {
        td.appendChild(document.createTextNode(inst[i].getId()));
        tr.appendChild(td);
      }
      else {
        td.appendChild(document.createTextNode("-"));
        tr.appendChild(td);
      }
    }
    document.getElementById(id).appendChild(tr);
  }

  addRowUF(uf){
    let tr = document.createElement("tr");
    for(let i = 0; i < uf.length;i++){
        let td = document.createElement("td");
        if (uf[i].getInstruction()!= null){
            td.appendChild(document.createTextNode(uf[i].getInstruction().getId()));
            tr.appendChild(td);
        }
        else
        {
            td.appendChild(document.createTextNode("-"));
            tr.appendChild(td);
        }
        
    }
    document.getElementById("tablaUF").appendChild(tr);
}

  private createTableHead(desc: string, num: number) {
    let array = [];
    for (let i = 0; i < num; i++) {
      array.push(desc + i);
    }
    this[desc + 'Headers'] = array;
  }

  private createTableHeadUF(desc: string, numM: number, numMem: number, numA: number) {
    let array = [];
    for (let i = 0; i < numM; i++) {
      array.push(desc + "M" + i);
    }
    for (let i = 0; i < numA; i++) {
      array.push(desc + "A" + i);
    }
    for (let i = 0; i < numMem; i++) {
      array.push(desc + "Mem" + i);
    }
    this[desc + 'Headers'] = array;
  }



}
